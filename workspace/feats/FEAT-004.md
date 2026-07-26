# FEAT-004: Live Barcode Scanner & Open Food Facts Lookup

## Description
Provides real-time camera barcode scanning for packaged foods, querying Open Food Facts API to instantly extract official nutrition facts.

## User Stories
- **US-004-1**: As a user, I want to point my phone camera at a product barcode to automatically scan it.
- **US-004-2**: As a user, I want to immediately see product title, brand, image, serving size, calories, and macros upon barcode match.
- **US-004-3**: As a user, I want to input a barcode manually if camera scanning is not available.

## Technical Requirements
- Web Barcode Scanning: `BarcodeDetector` API (built-in browser API) + fallback JS barcode parser.
- Open Food Facts Product API: `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`
- Response fields: `product.product_name`, `product.brands`, `product.image_url`, `product.nutriments`.
