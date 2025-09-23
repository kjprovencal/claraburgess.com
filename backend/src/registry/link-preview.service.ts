import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as cheerio from 'cheerio';
import { LinkPreviewCache } from './entities/link-preview-cache.entity';
import { LinkPreviewDto } from './dto/link-preview.dto';

@Injectable()
export class LinkPreviewService {
  private readonly logger = new Logger(LinkPreviewService.name);

  // Cache TTL: 7 days for link previews
  private readonly CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

  // Rate limiting: track last request time per domain
  private readonly lastRequestTimes = new Map<string, number>();
  private readonly MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests to same domain

  constructor(
    @InjectRepository(LinkPreviewCache)
    private linkPreviewCacheRepository: Repository<LinkPreviewCache>,
  ) {}

  async generatePreview(
    url: string,
    fallbackData?: { name?: string; imageUrl?: string; description?: string },
  ): Promise<LinkPreviewDto> {
    // First, check if we have a valid cached preview
    const cachedPreview = await this.getCachedPreview(url);
    if (cachedPreview) {
      this.logger.debug(`Using cached preview for ${url}`);
      return cachedPreview;
    }

    // Generate new preview and cache it
    this.logger.debug(`Generating new preview for ${url}`);
    const preview = await this.generateNewPreview(url);

    // If scraping failed, try fallback methods
    if (preview.title === 'Preview unavailable') {
      this.logger.log(
        `Primary scraping failed for ${url}, trying fallback methods`,
      );
      const fallbackPreview = await this.tryFallbackMethods(url);
      if (fallbackPreview.title !== 'Preview unavailable') {
        // Cache the fallback preview
        this.cachePreview(url, fallbackPreview).catch((error) => {
          this.logger.warn(
            `Failed to cache fallback preview for ${url}:`,
            error,
          );
        });
        return fallbackPreview;
      }
    }

    // If all scraping methods failed, use manual fallback data
    if (preview.title === 'Preview unavailable' && fallbackData) {
      this.logger.log(`Using manual fallback data for ${url}`);
      const manualPreview = this.createManualPreview(url, fallbackData);

      // Cache the manual preview
      this.cachePreview(url, manualPreview).catch((error) => {
        this.logger.warn(`Failed to cache manual preview for ${url}:`, error);
      });

      return manualPreview;
    }

    // Cache the preview (don't await to avoid blocking the response)
    this.cachePreview(url, preview).catch((error) => {
      this.logger.warn(`Failed to cache preview for ${url}:`, error);
    });

    return preview;
  }

  async getCacheStats(): Promise<{
    totalCached: number;
    validCached: number;
    cacheHitRate?: number;
  }> {
    try {
      const now = new Date();

      const [totalCached, validCached] = await Promise.all([
        this.linkPreviewCacheRepository.count(),
        this.linkPreviewCacheRepository
          .createQueryBuilder()
          .where('expiresAt >= :now', { now })
          .getCount(),
      ]);

      return {
        totalCached,
        validCached,
        cacheHitRate: totalCached > 0 ? (validCached / totalCached) * 100 : 0,
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats:', error);
      return {
        totalCached: 0,
        validCached: 0,
        cacheHitRate: 0,
      };
    }
  }

  async cleanupExpiredCache(): Promise<void> {
    try {
      const result = await this.linkPreviewCacheRepository
        .createQueryBuilder()
        .delete()
        .where('expiresAt < :now', { now: new Date() })
        .execute();

      this.logger.log(`Cleaned up ${result.affected} expired cache entries`);
    } catch (error) {
      this.logger.error('Failed to cleanup expired cache:', error);
    }
  }

  async invalidateCacheForUrl(url: string): Promise<void> {
    try {
      await this.linkPreviewCacheRepository.delete({ url });
      this.logger.debug(`Invalidated cache for URL: ${url}`);
    } catch (error) {
      this.logger.warn(`Failed to invalidate cache for URL ${url}:`, error);
    }
  }

  async getCachedPreview(url: string): Promise<LinkPreviewDto | null> {
    try {
      const cached = await this.linkPreviewCacheRepository.findOne({
        where: { url },
      });

      if (!cached) {
        return null;
      }

      // Check if cache has expired
      if (cached.expiresAt < new Date()) {
        // Clean up expired cache
        await this.linkPreviewCacheRepository.remove(cached);
        this.logger.debug(`Cleaned up expired cache for ${url}`);
        return null;
      }

      return {
        url: cached.url,
        title: cached.title,
        description: cached.description,
        imageUrl: cached.imageUrl,
        siteName: cached.siteName,
        price: cached.price,
        availability: cached.availability,
        expiresAt: cached.expiresAt,
      };
    } catch (error) {
      this.logger.warn(`Failed to get cached preview for ${url}:`, error);
      return null;
    }
  }

  private async cachePreview(
    url: string,
    preview: LinkPreviewDto,
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + this.CACHE_TTL_MS);

      // Check if cache already exists
      const existingCache = await this.linkPreviewCacheRepository.findOne({
        where: { url },
      });

      if (existingCache) {
        // Update existing cache
        existingCache.title = preview.title;
        existingCache.description = preview.description;
        existingCache.imageUrl = preview.imageUrl;
        existingCache.siteName = preview.siteName;
        existingCache.price = preview.price;
        existingCache.availability = preview.availability;
        existingCache.expiresAt = expiresAt;
        await this.linkPreviewCacheRepository.save(existingCache);
      } else {
        // Create new cache entry
        const cacheEntry = this.linkPreviewCacheRepository.create({
          url,
          title: preview.title,
          description: preview.description,
          imageUrl: preview.imageUrl,
          siteName: preview.siteName,
          price: preview.price,
          availability: preview.availability,
          expiresAt,
        });
        await this.linkPreviewCacheRepository.save(cacheEntry);
      }
    } catch (error) {
      this.logger.error(`Failed to cache preview for ${url}:`, error);
    }
  }

  private async generateNewPreview(url: string): Promise<LinkPreviewDto> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    // Rate limiting: ensure we don't make requests too frequently to the same domain
    await this.enforceRateLimit(url);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Add random delay to avoid rate limiting (longer delay for retries)
        const delay = attempt === 1 ? 1000 : 2000 + attempt * 1000;
        await this.randomDelay(delay, delay + 2000);

        const userAgent = this.getRandomUserAgent();
        const headers = this.getRealisticHeaders(userAgent);

        this.logger.log(
          `Attempt ${attempt}/${maxRetries} for ${url} with User-Agent: ${userAgent.substring(0, 50)}...`,
        );

        const response = await fetch(url, {
          headers,
          // Add timeout
          signal: AbortSignal.timeout(15000), // 15 second timeout
          // Add redirect handling
          redirect: 'follow',
        });

        // Check for bot detection responses
        if (response.status === 403 || response.status === 429) {
          const responseText = await response.text();
          if (
            responseText.includes('Robot or human') ||
            responseText.includes('Access Denied') ||
            responseText.includes('bot') ||
            responseText.includes('captcha')
          ) {
            this.logger.warn(
              `Bot detection triggered for ${url} on attempt ${attempt}`,
            );
            if (attempt < maxRetries) {
              // Wait longer before retry
              await this.randomDelay(5000, 10000);
              continue;
            }
            throw new Error(
              `Bot detection: ${response.status} - ${response.statusText}`,
            );
          }
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();

        // Check if we got a bot detection page in the HTML
        if (
          html.includes('Robot or human') ||
          html.includes('Access Denied') ||
          html.includes('Please verify you are human') ||
          html.includes('captcha') ||
          html.includes('Cloudflare') ||
          html.includes('security check') ||
          html.includes('verify you are human') ||
          html.includes('bot detection') ||
          html.includes('unusual traffic') ||
          html.includes('automated requests')
        ) {
          this.logger.warn(
            `Bot detection page received for ${url} on attempt ${attempt}`,
          );
          if (attempt < maxRetries) {
            await this.randomDelay(5000, 10000);
            continue;
          }
          throw new Error('Bot detection page received');
        }

        // Additional check: if the title is "Robot or human?" or similar bot detection titles
        const $ = cheerio.load(html);
        const pageTitle = $('title').text().toLowerCase();
        if (
          pageTitle.includes('robot or human') ||
          pageTitle.includes('access denied') ||
          pageTitle.includes('security check') ||
          pageTitle.includes('captcha') ||
          pageTitle.includes('bot detection')
        ) {
          this.logger.warn(
            `Bot detection title detected for ${url} on attempt ${attempt}: "${pageTitle}"`,
          );
          if (attempt < maxRetries) {
            await this.randomDelay(5000, 10000);
            continue;
          }
          throw new Error(`Bot detection title: ${pageTitle}`);
        }

        // Extract title - prioritize HTML scraping for Amazon
        const title = this.extractProductTitle($, url);

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

        const extractedTitle = title || this.extractTitle($);

        // Final check: ensure we don't return bot detection titles
        if (extractedTitle && this.isBotDetectionTitle(extractedTitle)) {
          this.logger.warn(
            `Bot detection title in final result for ${url}: "${extractedTitle}"`,
          );
          throw new Error(`Bot detection title in result: ${extractedTitle}`);
        }

        const result = {
          title: extractedTitle,
          imageUrl: this.resolveImageUrl(imageUrl, url),
          siteName,
          url,
          price: price ? parseFloat(price) : undefined,
          availability,
        };

        this.logger.log(`Successfully scraped ${url} on attempt ${attempt}`);
        return result;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Attempt ${attempt}/${maxRetries} failed for ${url}: ${lastError.message}`,
        );

        if (attempt === maxRetries) {
          break;
        }

        // Wait before retry
        await this.randomDelay(2000, 5000);
      }
    }

    // All retries failed
    this.logger.error(
      `Failed to generate preview for ${url} after ${maxRetries} attempts:`,
      lastError,
    );
    return {
      url,
      title: 'Preview unavailable',
      description:
        'Unable to load preview for this link - may be blocked by anti-bot measures',
    };
  }

  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  private async enforceRateLimit(url: string): Promise<void> {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const now = Date.now();

      const lastRequestTime = this.lastRequestTimes.get(domain);
      if (lastRequestTime) {
        const timeSinceLastRequest = now - lastRequestTime;
        if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
          const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
          this.logger.log(
            `Rate limiting: waiting ${waitTime}ms before next request to ${domain}`,
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }

      // Update the last request time
      this.lastRequestTimes.set(domain, Date.now());
    } catch (error) {
      // If URL parsing fails, just continue without rate limiting
      this.logger.warn(`Failed to parse URL for rate limiting: ${url}`, error);
    }
  }

  private getRandomUserAgent(): string {
    const userAgents = [
      // Chrome on Windows
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',

      // Chrome on macOS
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',

      // Firefox on Windows
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',

      // Firefox on macOS
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:119.0) Gecko/20100101 Firefox/119.0',

      // Safari on macOS
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',

      // Edge on Windows
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
    ];

    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  private getRealisticHeaders(userAgent: string): Record<string, string> {
    const isChrome = userAgent.includes('Chrome');
    const isFirefox = userAgent.includes('Firefox');
    const isSafari =
      userAgent.includes('Safari') && !userAgent.includes('Chrome');
    const isEdge = userAgent.includes('Edg');

    const headers: Record<string, string> = {
      'User-Agent': userAgent,
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      DNT: '1',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
    };

    // Add browser-specific headers
    if (isChrome || isEdge) {
      headers['Sec-Ch-Ua'] =
        '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
      headers['Sec-Ch-Ua-Mobile'] = '?0';
      headers['Sec-Ch-Ua-Platform'] = '"Windows"';
    }

    if (isFirefox) {
      headers['Sec-Fetch-User'] = '?1';
    }

    return headers;
  }

  private async tryFallbackMethods(url: string): Promise<LinkPreviewDto> {
    // Method 1: Try with a different approach - mobile user agent
    try {
      this.logger.log(`Trying mobile user agent fallback for ${url}`);
      const mobilePreview = await this.tryMobileUserAgent(url);
      if (mobilePreview.title !== 'Preview unavailable') {
        return mobilePreview;
      }
    } catch (error) {
      this.logger.warn(`Mobile user agent fallback failed for ${url}:`, error);
    }

    // Method 2: Try with minimal headers
    try {
      this.logger.log(`Trying minimal headers fallback for ${url}`);
      const minimalPreview = await this.tryMinimalHeaders(url);
      if (minimalPreview.title !== 'Preview unavailable') {
        return minimalPreview;
      }
    } catch (error) {
      this.logger.warn(`Minimal headers fallback failed for ${url}:`, error);
    }

    // Method 3: Try to extract basic info from URL patterns
    try {
      this.logger.log(`Trying URL pattern extraction for ${url}`);
      const patternPreview = this.extractFromUrlPattern(url);
      if (patternPreview.title !== 'Preview unavailable') {
        return patternPreview;
      }
    } catch (error) {
      this.logger.warn(`URL pattern extraction failed for ${url}:`, error);
    }

    return {
      url,
      title: 'Preview unavailable',
      description: 'Unable to load preview - all methods failed',
    };
  }

  private async tryMobileUserAgent(url: string): Promise<LinkPreviewDto> {
    const mobileUserAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    ];

    const userAgent =
      mobileUserAgents[Math.floor(Math.random() * mobileUserAgents.length)];
    const headers = {
      'User-Agent': userAgent,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      Connection: 'keep-alive',
    };

    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    return {
      title: this.extractProductTitle($, url) || this.extractTitle($),
      imageUrl: this.extractProductImage($, url),
      siteName: this.extractMetaContent($, ['og:site_name', 'twitter:site']),
      url,
      price: this.extractPrice($)
        ? parseFloat(this.extractPrice($)!)
        : undefined,
      availability: this.extractAvailability($),
    };
  }

  private async tryMinimalHeaders(url: string): Promise<LinkPreviewDto> {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    };

    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    return {
      title: this.extractProductTitle($, url) || this.extractTitle($),
      imageUrl: this.extractProductImage($, url),
      siteName: this.extractMetaContent($, ['og:site_name', 'twitter:site']),
      url,
      price: this.extractPrice($)
        ? parseFloat(this.extractPrice($)!)
        : undefined,
      availability: this.extractAvailability($),
    };
  }

  private createManualPreview(
    url: string,
    fallbackData: { name?: string; imageUrl?: string; description?: string },
  ): LinkPreviewDto {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // Extract site name from URL
      let siteName = '';
      if (hostname.includes('amazon.com')) siteName = 'Amazon';
      else if (hostname.includes('walmart.com')) siteName = 'Walmart';
      else if (hostname.includes('target.com')) siteName = 'Target';
      else if (hostname.includes('buybuybaby.com')) siteName = 'BuyBuy Baby';
      else if (hostname.includes('babylist.com')) siteName = 'Babylist';
      else {
        siteName = hostname.replace('www.', '').split('.')[0];
        siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
      }

      return {
        url,
        title: fallbackData.name || 'Product from ' + siteName,
        imageUrl: fallbackData.imageUrl,
        siteName,
        description:
          fallbackData.description || `Product available at ${siteName}`,
      };
    } catch (error) {
      return {
        url,
        title: fallbackData.name || 'Preview unavailable',
        imageUrl: fallbackData.imageUrl,
        description:
          fallbackData.description || 'Unable to extract information from URL',
      };
    }
  }

  private extractFromUrlPattern(url: string): LinkPreviewDto {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // Extract basic info from URL patterns
      let siteName = '';
      if (hostname.includes('amazon.com')) siteName = 'Amazon';
      else if (hostname.includes('walmart.com')) siteName = 'Walmart';
      else if (hostname.includes('target.com')) siteName = 'Target';
      else if (hostname.includes('buybuybaby.com')) siteName = 'BuyBuy Baby';
      else if (hostname.includes('babylist.com')) siteName = 'Babylist';
      else {
        siteName = hostname.replace('www.', '').split('.')[0];
        siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
      }

      // Try to extract product name from URL path
      const pathParts = urlObj.pathname
        .split('/')
        .filter((part) => part.length > 0);
      let title = '';
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1];
        title = lastPart
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
      }

      return {
        url,
        title: title || 'Product from ' + siteName,
        siteName,
        description: `Product available at ${siteName}`,
      };
    } catch (error) {
      return {
        url,
        title: 'Preview unavailable',
        description: 'Unable to extract information from URL',
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
    // First check if we're on a bot detection page
    const pageTitle = $('title').text().trim();
    if (this.isBotDetectionTitle(pageTitle)) {
      this.logger.warn(
        `Bot detection title detected in extractProductTitle: "${pageTitle}"`,
      );
      return undefined; // Return undefined to trigger fallback
    }

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
      if (title && title.length > 0 && !this.isBotDetectionTitle(title)) {
        return title;
      }
    }

    // Fallback to Open Graph meta tags
    const ogTitle = this.extractMetaContent($, ['og:title', 'twitter:title']);

    if (ogTitle && ogTitle.length > 0 && !this.isBotDetectionTitle(ogTitle)) {
      return ogTitle;
    }

    // Last resort: page title (but check for bot detection)
    const finalTitle = this.extractTitle($);
    if (finalTitle && !this.isBotDetectionTitle(finalTitle)) {
      return finalTitle;
    }

    return undefined;
  }

  private isBotDetectionTitle(title: string): boolean {
    if (!title) return false;

    const lowerTitle = title.toLowerCase();
    return (
      lowerTitle.includes('robot or human') ||
      lowerTitle.includes('access denied') ||
      lowerTitle.includes('security check') ||
      lowerTitle.includes('captcha') ||
      lowerTitle.includes('bot detection') ||
      lowerTitle.includes('verify you are human') ||
      lowerTitle.includes('unusual traffic') ||
      lowerTitle.includes('automated requests') ||
      lowerTitle.includes('cloudflare') ||
      lowerTitle.includes('please wait') ||
      lowerTitle.includes('checking your browser')
    );
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
