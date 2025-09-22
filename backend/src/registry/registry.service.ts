import * as cheerio from 'cheerio';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistryItem } from './entities/registry-item.entity';
import {
  CreateRegistryItemDto,
  UpdateRegistryItemDto,
} from './dto/registry.dto';
import { LinkPreviewDto } from './dto/link-preview.dto';

@Injectable()
export class RegistryService {
  private readonly logger = new Logger(RegistryService.name);

  constructor(
    @InjectRepository(RegistryItem)
    private registryItemsRepository: Repository<RegistryItem>,
  ) {}

  async getAllItems(): Promise<RegistryItem[]> {
    return this.registryItemsRepository.find({
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

  async togglePurchased(id: string): Promise<RegistryItem> {
    const item = await this.getItemById(id);
    item.purchased = !item.purchased;
    return this.registryItemsRepository.save(item);
  }

  async generatePreview(url: string): Promise<LinkPreviewDto> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          Connection: 'keep-alive',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract title - prioritize HTML scraping for Amazon
      const title = this.extractProductTitle($, url);

      const description = this.extractMetaContent($, [
        'og:description',
        'twitter:description',
        'description',
      ]);

      // Try to get the best product image, not just Open Graph
      const imageUrl = this.extractProductImage($, url);

      const siteName = this.extractMetaContent($, [
        'og:site_name',
        'twitter:site',
      ]);

      // Extract price information (common patterns)
      const price = this.extractPrice($);

      // Extract availability
      const availability = this.extractAvailability($);

      return {
        title: title || this.extractTitle($),
        description,
        imageUrl: this.resolveImageUrl(imageUrl, url),
        siteName,
        url,
        price,
        availability,
      };
    } catch (error) {
      this.logger.error(`Failed to generate preview for ${url}:`, error);
      return {
        url,
        title: 'Preview unavailable',
        description: 'Unable to load preview for this link',
      };
    }
  }

  private extractMetaContent(
    $: cheerio.Root,
    selectors: string[],
  ): string | undefined {
    for (const selector of selectors) {
      const content = $(
        `meta[property="${selector}"], meta[name="${selector}"]`,
      ).attr('content');
      if (content && content.trim()) {
        return content.trim();
      }
    }
    return undefined;
  }

  private extractTitle($: cheerio.Root): string | undefined {
    return $('title').first().text().trim() || undefined;
  }

  private extractProductTitle(
    $: cheerio.Root,
    baseUrl: string,
  ): string | undefined {
    // Check if this is Amazon first - they have specific title structure
    const isAmazon = baseUrl.includes('amazon.');

    if (isAmazon) {
      return this.extractAmazonTitle($);
    }

    // For other sites, try product-specific title selectors first
    const productTitleSelectors = [
      // Common e-commerce title selectors
      'h1.product-title',
      'h1.product-name',
      '.product-title',
      '.product-name',
      '.item-title',
      '.product-heading',
      '.product-header h1',
      '.product-info h1',
      '.product-details h1',

      // Generic title patterns
      'h1[class*="title"]',
      'h1[class*="name"]',
      '.title h1',
      '.name h1',
    ];

    // Look for product-specific titles first
    for (const selector of productTitleSelectors) {
      const title = $(selector).first().text().trim();
      if (title && title.length > 0) {
        return title;
      }
    }

    // Fallback to Open Graph meta tags
    const ogTitle = this.extractMetaContent($, ['og:title', 'twitter:title']);

    if (ogTitle && ogTitle.length > 0) {
      return ogTitle;
    }

    // Last resort: page title
    return this.extractTitle($);
  }

  private extractAmazonTitle($: cheerio.Root): string | undefined {
    // Amazon-specific title extraction
    const amazonTitleSelectors = [
      '#productTitle', // Main product title
      '.product-title', // Alternative title class
      'h1.a-size-large', // Amazon's h1 with size class
      '.a-size-large.product-title', // Combined classes
      '#title h1', // Title section h1
      '.a-size-base-plus', // Amazon's base size class
    ];

    // Try Amazon-specific selectors first
    for (const selector of amazonTitleSelectors) {
      const title = $(selector).first().text().trim();
      if (title && title.length > 0) {
        // Clean up Amazon title (remove extra whitespace, newlines)
        return title.replace(/\s+/g, ' ').trim();
      }
    }

    // Fallback to page title if no product title found
    const pageTitle = this.extractTitle($);
    if (pageTitle) {
      // Clean up Amazon page titles (they often have "Amazon.com:" prefix)
      return pageTitle
        .replace(/^Amazon\.com:\s*/, '')
        .replace(/^Amazon\s*:\s*/, '')
        .replace(/\s*:\s*Amazon\.com.*$/, '')
        .trim();
    }

    return undefined;
  }

  private extractProductImage(
    $: cheerio.Root,
    baseUrl: string,
  ): string | undefined {
    // Check if this is Amazon first - they need special handling
    const isAmazon =
      baseUrl.includes('amazon.com') || baseUrl.includes('amazon.');

    if (isAmazon) {
      return this.extractAmazonImage($, baseUrl);
    }

    // For other sites, try product-specific selectors first
    const productImageSelectors = [
      // Target specific selectors
      '[data-testid="product-image"]',
      '.h-image-wrapper img',
      '.product-image img',

      // Generic e-commerce selectors
      '.product-image img',
      '.main-image img',
      '.hero-image img',
      '.product-photo img',
      '.item-image img',
      '.product-gallery img',
      '.image-gallery img',
      '.product-main-image img',
      '.primary-image img',
      '.main-product-image img',

      // Common product image patterns
      'img[alt*="product"]',
      'img[alt*="item"]',
      'img[class*="product"]',
      'img[class*="main"]',
      'img[class*="hero"]',
      'img[class*="primary"]',
    ];

    // Look for product images first
    for (const selector of productImageSelectors) {
      const img = $(selector).first();
      if (img.length) {
        const src =
          img.attr('src') || img.attr('data-src') || img.attr('data-lazy');
        if (src && this.isValidProductImage(src)) {
          return this.resolveImageUrl(src, baseUrl);
        }
      }
    }

    // Fallback to Open Graph images for non-Amazon sites
    const ogImage = this.extractMetaContent($, [
      'og:image',
      'twitter:image',
      'twitter:image:src',
    ]);

    if (ogImage && this.isValidProductImage(ogImage)) {
      return this.resolveImageUrl(ogImage, baseUrl);
    }

    // Last resort: look for any large image that might be a product
    const largeImages = $('img').filter((_, el) => {
      const $img = $(el);
      const src = $img.attr('src') || $img.attr('data-src');
      const width = parseInt($img.attr('width') || '0');
      const height = parseInt($img.attr('height') || '0');

      return !!(
        src &&
        this.isValidProductImage(src) &&
        (width > 200 || height > 200) &&
        !this.isLogoImage(src, $img.attr('alt') || '')
      );
    });

    if (largeImages.length > 0) {
      const src =
        largeImages.first().attr('src') || largeImages.first().attr('data-src');
      if (src) {
        return this.resolveImageUrl(src, baseUrl);
      }
    }

    return undefined;
  }

  private extractAmazonImage(
    $: cheerio.Root,
    baseUrl: string,
  ): string | undefined {
    // Amazon-specific image extraction - they don't use Open Graph
    const amazonSelectors = [
      // Main product image containers
      '#landingImage',
      '#imgBlkFront',
      '#main-image-container img',
      '.a-dynamic-image',

      // Amazon's image wrapper classes
      '.a-image-wrapper img',
      '.a-dynamic-image-container img',
      '.a-image-container img',

      // High-resolution image data attributes
      'img[data-old-hires]',
      'img[data-a-dynamic-image]',

      // Alternative selectors for different Amazon layouts
      '#altImages img',
      '.a-button-selected img',
      '.a-carousel-item img',

      // Product image gallery
      '.a-carousel-container img',
      '.a-button-text img',
    ];

    // Try Amazon-specific selectors first
    for (const selector of amazonSelectors) {
      const img = $(selector).first();
      if (img.length) {
        // Check multiple possible image sources
        const src =
          img.attr('src') ||
          img.attr('data-src') ||
          img.attr('data-lazy') ||
          img.attr('data-old-hires') ||
          img.attr('data-a-dynamic-image');

        if (src && this.isValidProductImage(src)) {
          return this.resolveImageUrl(src, baseUrl);
        }
      }
    }

    // Look for any img tag with Amazon's image URL patterns
    const amazonImages = $('img').filter((_, el) => {
      const $img = $(el);
      const src = $img.attr('src') || $img.attr('data-src');

      if (!src) return false;

      // Check if it's an Amazon product image URL
      const isAmazonImage =
        src.includes('images-amazon.com') ||
        src.includes('m.media-amazon.com') ||
        src.includes('amazon-adsystem.com');

      return (
        isAmazonImage &&
        this.isValidProductImage(src) &&
        !this.isLogoImage(src, $img.attr('alt') || '')
      );
    });

    if (amazonImages.length > 0) {
      const src =
        amazonImages.first().attr('src') ||
        amazonImages.first().attr('data-src');
      if (src) {
        return this.resolveImageUrl(src, baseUrl);
      }
    }

    return undefined;
  }

  private isValidProductImage(src: string): boolean {
    // Filter out common logo/icon patterns
    const logoPatterns = [
      'logo',
      'icon',
      'brand',
      'header',
      'footer',
      'nav',
      'banner',
      'advertisement',
      'ad-',
      'sponsor',
      'social',
      'facebook',
      'twitter',
      'instagram',
      'youtube',
      'pinterest',
      'amazon-logo',
      'target-logo',
      'walmart-logo',
    ];

    const lowerSrc = src.toLowerCase();
    return !logoPatterns.some((pattern) => lowerSrc.includes(pattern));
  }

  private isLogoImage(src: string, alt: string): boolean {
    const logoKeywords = [
      'logo',
      'brand',
      'icon',
      'header',
      'footer',
      'nav',
      'banner',
      'amazon',
      'target',
      'walmart',
      'shop',
      'store',
      'company',
    ];

    const lowerSrc = src.toLowerCase();
    const lowerAlt = alt.toLowerCase();

    return logoKeywords.some(
      (keyword) => lowerSrc.includes(keyword) || lowerAlt.includes(keyword),
    );
  }

  private extractPrice($: cheerio.Root): string | undefined {
    // Common price selectors for e-commerce sites
    const priceSelectors = [
      '[data-testid*="price"]',
      '.price',
      '.product-price',
      '[class*="price"]',
      '[id*="price"]',
      '.a-price-whole', // Amazon
      '.a-offscreen', // Amazon
      '[data-testid="product-price"]', // Target
      '.h-text-bold', // Target
    ];

    for (const selector of priceSelectors) {
      const priceText = $(selector).first().text().trim();
      if (priceText && /\$[\d,]+\.?\d*/.test(priceText)) {
        return priceText;
      }
    }

    // Look for price in meta tags
    const metaPrice = this.extractMetaContent($, [
      'product:price:amount',
      'og:price:amount',
      'twitter:data1',
    ]);

    if (metaPrice && /\$[\d,]+\.?\d*/.test(metaPrice)) {
      return metaPrice;
    }

    return undefined;
  }

  private extractAvailability($: cheerio.Root): string | undefined {
    // Common availability indicators
    const availabilitySelectors = [
      '[data-testid*="availability"]',
      '.availability',
      '.stock-status',
      '[class*="availability"]',
      '[class*="stock"]',
      '.a-size-medium.a-color-success', // Amazon
      '.a-size-medium.a-color-price', // Amazon
    ];

    for (const selector of availabilitySelectors) {
      const availabilityText = $(selector).first().text().trim();
      if (availabilityText && availabilityText.length < 50) {
        return availabilityText;
      }
    }

    return undefined;
  }

  private resolveImageUrl(
    imageUrl: string | undefined,
    baseUrl: string,
  ): string | undefined {
    if (!imageUrl) return undefined;

    // If it's already a full URL, return it
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // If it starts with //, add the protocol
    if (imageUrl.startsWith('//')) {
      return `https:${imageUrl}`;
    }

    // If it starts with /, it's a relative URL
    if (imageUrl.startsWith('/')) {
      const url = new URL(baseUrl);
      return `${url.protocol}//${url.host}${imageUrl}`;
    }

    // Otherwise, it's relative to the current path
    const url = new URL(baseUrl);
    const pathParts = url.pathname.split('/');
    pathParts[pathParts.length - 1] = imageUrl;
    return `${url.protocol}//${url.host}${pathParts.join('/')}`;
  }
}
