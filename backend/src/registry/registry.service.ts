import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as cheerio from 'cheerio';
import { RegistryItem } from './entities/registry-item.entity';
import { Purchase } from './entities/purchase.entity';
import {
  CreateRegistryItemDto,
  UpdateRegistryItemDto,
} from './dto/registry.dto';
import { CreatePurchaseDto, PurchaseDto } from './dto/purchase.dto';
import { LinkPreviewDto } from 'src/registry/dto/link-preview.dto';

@Injectable()
export class RegistryService {
  private readonly logger = new Logger(RegistryService.name);

  constructor(
    @InjectRepository(RegistryItem)
    private registryItemsRepository: Repository<RegistryItem>,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
  ) {}

  async getAllItems(): Promise<RegistryItem[]> {
    return this.registryItemsRepository.find({
      relations: ['purchases'],
      order: { createdAt: 'DESC' },
    });
  }

  async getItemById(id: string): Promise<RegistryItem> {
    const item = await this.registryItemsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Registry item with ID ${id} not found`);
    }

    return item;
  }

  async createItem(
    createItemDto: CreateRegistryItemDto,
  ): Promise<RegistryItem> {
    const newItem = this.registryItemsRepository.create(createItemDto);
    return this.registryItemsRepository.save(newItem);
  }

  async updateItem(
    id: string,
    updateItemDto: UpdateRegistryItemDto,
  ): Promise<RegistryItem> {
    const item = await this.getItemById(id);
    Object.assign(item, updateItemDto);
    return this.registryItemsRepository.save(item);
  }

  async deleteItem(id: string): Promise<void> {
    const item = await this.getItemById(id);
    await this.registryItemsRepository.remove(item);
  }

  async purchase(
    id: string,
    purchaseData: CreatePurchaseDto,
  ): Promise<RegistryItem> {
    const item = await this.getItemById(id);

    // Validate quantity
    if (purchaseData.quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    // Create purchase record
    const purchase = this.purchaseRepository.create({
      ...purchaseData,
      registryItemId: id,
    });
    await this.purchaseRepository.save(purchase);

    // Update item purchased quantity
    item.purchasedQuantity += purchaseData.quantity;
    item.purchased = item.purchasedQuantity > 0;

    return this.registryItemsRepository.save(item);
  }

  async getItemPurchases(id: string): Promise<PurchaseDto[]> {
    const purchases = await this.purchaseRepository.find({
      where: { registryItemId: id },
      order: { createdAt: 'DESC' },
    });

    return purchases.map((purchase) => ({
      id: purchase.id,
      registryItemId: purchase.registryItemId,
      quantity: purchase.quantity,
      buyerName: purchase.buyerName,
      purchaseLocation: purchase.purchaseLocation,
      orderNumber: purchase.orderNumber,
      thankYouAddress: purchase.thankYouAddress,
      similarItemDescription: purchase.similarItemDescription,
      giftType: purchase.giftType,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
    }));
  }

  async getLinkPreview(
    url: string,
    fallbackData?: { name?: string; imageUrl?: string; description?: string },
  ): Promise<LinkPreviewDto> {
    try {
      this.logger.log(`Scraping preview for ${url}`);

      const userAgent = this.getRandomUserAgent();
      const headers = this.getRealisticHeaders(userAgent);

      const response = await fetch(url, {
        headers,
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Check if we got a bot detection page
      if (this.isBotDetectionPage(html, $)) {
        this.logger.warn(`Bot detection page received for ${url}`);
        throw new Error('Bot detection page received');
      }

      // Extract data
      const title = this.extractProductTitle($, url) || this.extractTitle($);
      const imageUrl = this.extractProductImage($, url);
      const siteName = this.extractMetaContent($, [
        'og:site_name',
        'twitter:site',
      ]);
      const price = this.extractPrice($);
      const availability = this.extractAvailability($);
      const description = this.extractDescription($);

      // Final check: ensure we don't return bot detection titles
      if (title && this.isBotDetectionTitle(title)) {
        this.logger.warn(
          `Bot detection title in result for ${url}: "${title}"`,
        );
        throw new Error(`Bot detection title in result: ${title}`);
      }

      const result = {
        title: title || fallbackData?.name,
        imageUrl: this.resolveImageUrl(imageUrl, url) || fallbackData?.imageUrl,
        description: description || fallbackData?.description,
        siteName: siteName || undefined,
        url,
        price: price ? parseFloat(price) : undefined,
        availability: availability || undefined,
      };

      this.logger.log(`Successfully scraped ${url}`);
      return result;
    } catch (error) {
      this.logger.warn(`Failed to scrape ${url}:`, error);

      // Return fallback data if available
      if (fallbackData) {
        return {
          url,
          title: fallbackData.name,
          imageUrl: fallbackData.imageUrl,
          description: fallbackData.description,
          siteName: undefined,
          price: undefined,
          availability: undefined,
        };
      }

      throw error;
    }
  }

  private getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  private getRealisticHeaders(userAgent: string): Record<string, string> {
    return {
      'User-Agent': userAgent,
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      DNT: '1',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    };
  }

  private isBotDetectionPage(html: string, $: cheerio.Root): boolean {
    const botDetectionKeywords = [
      'access denied',
      'blocked',
      'captcha',
      'cloudflare',
      'security check',
      'bot detection',
      'please verify',
      'unusual traffic',
    ];

    const lowerHtml = html.toLowerCase();
    return botDetectionKeywords.some((keyword) => lowerHtml.includes(keyword));
  }

  private isBotDetectionTitle(title: string): boolean {
    const botDetectionTitles = [
      'access denied',
      'blocked',
      'captcha',
      'cloudflare',
      'security check',
      'bot detection',
      'please verify',
      'unusual traffic',
    ];

    const lowerTitle = title.toLowerCase();
    return botDetectionTitles.some((keyword) => lowerTitle.includes(keyword));
  }

  private extractProductTitle($: cheerio.Root, url: string): string | null {
    // Amazon-specific extraction
    if (url.includes('amazon.')) {
      return (
        $('#productTitle').text().trim() ||
        $('h1.a-size-large').text().trim() ||
        $('h1[data-automation-id="product-title"]').text().trim() ||
        null
      );
    }

    // Generic extraction
    return $('h1').first().text().trim() || $('title').text().trim() || null;
  }

  private extractProductImage($: cheerio.Root, url: string): string | null {
    // Amazon-specific extraction
    if (url.includes('amazon.')) {
      return (
        $('#landingImage').attr('src') ||
        $('#imgTagWrapperId img').attr('src') ||
        $('[data-a-dynamic-image]').attr('src') ||
        null
      );
    }

    // Generic extraction
    return (
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('img').first().attr('src') ||
      null
    );
  }

  private extractMetaContent(
    $: cheerio.Root,
    properties: string[],
  ): string | null {
    for (const prop of properties) {
      const content =
        $(`meta[property="${prop}"]`).attr('content') ||
        $(`meta[name="${prop}"]`).attr('content');
      if (content) return content;
    }
    return null;
  }

  private extractTitle($: cheerio.Root): string | null {
    return $('title').text().trim() || null;
  }

  private extractDescription($: cheerio.Root): string | null {
    return (
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      null
    );
  }

  private extractPrice($: cheerio.Root): string | null {
    // Look for price patterns
    const priceSelectors = [
      '.price',
      '.price-current',
      '.price-value',
      '[data-testid="price"]',
      '.a-price-whole',
      '.a-offscreen',
    ];

    for (const selector of priceSelectors) {
      const priceText = $(selector).text().trim();
      if (priceText) {
        const match = priceText.match(/[\d,]+\.?\d*/);
        if (match) return match[0];
      }
    }

    return null;
  }

  private extractAvailability($: cheerio.Root): string | null {
    const availabilitySelectors = [
      '.availability',
      '.stock-status',
      '[data-testid="availability"]',
      '.a-size-medium.a-color-success',
      '.a-size-medium.a-color-price',
    ];

    for (const selector of availabilitySelectors) {
      const text = $(selector).text().trim();
      if (text) return text;
    }

    return null;
  }

  private resolveImageUrl(
    imageUrl: string | null,
    baseUrl: string,
  ): string | null {
    if (!imageUrl) return null;

    // If it's already a full URL, return it
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // If it's a relative URL, resolve it against the base URL
    try {
      return new URL(imageUrl, baseUrl).toString();
    } catch {
      return null;
    }
  }
}
