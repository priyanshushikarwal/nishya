BUILD THE COMPLETE ADMIN PANEL / CMS

The Supabase backend foundation is now complete.

Now build a premium admin dashboard that allows the website owner to control the entire ecommerce website WITHOUT editing code.

IMPORTANT:

The admin panel is NOT just for managing products.

It must function as a complete visual CMS for the storefront.

==================================================
1. ADMIN ROUTE
==================================================

Create:

/admin

Protected route.

Only users with:

role = admin

can access it.

Any normal customer trying to access:

/admin

must be denied/redirected.

Do NOT rely only on frontend checks.

Authorization must be enforced server-side and through Supabase RLS.

==================================================
2. ADMIN DASHBOARD
==================================================

Create a premium, clean dashboard.

Sidebar:

Dashboard
Products
Categories
Orders
Customers
Hero & Campaigns
Homepage
Media Library
Reviews
Coupons
Settings

Top bar:

Search
Notifications
Admin profile
Logout

Keep the UI professional and minimal.

Do NOT make it look like a generic ugly Bootstrap dashboard.

==================================================
3. DASHBOARD OVERVIEW
==================================================

Show:

Total Products
Active Products
Low Stock
Total Orders
Pending Orders
Revenue
Customers

Add recent orders.

Add quick actions:

+ Add Product
+ Create Hero Campaign
+ Upload Media

Analytics can initially use available database information.

Do not build fake statistics.

==================================================
4. PRODUCT MANAGEMENT
==================================================

Admin can:

✓ Create product
✓ Edit product
✓ Archive product
✓ Change price
✓ Change sale price
✓ Change SKU
✓ Change description
✓ Change material
✓ Change dimensions
✓ Change category
✓ Change status
✓ Mark featured
✓ Manage variants
✓ Manage stock
✓ Upload photographs
✓ Delete photographs
✓ Reorder photographs
✓ Set primary image

==================================================
5. PRODUCT IMAGE MANAGER
==================================================

This must be excellent.

Admin uploads multiple images.

Example:

[ Front ]
[ Side ]
[ Back ]
[ Interior ]
[ Detail ]
[ Lifestyle ]

Images should be draggable to reorder.

Admin can choose:

★ Primary image

Image metadata:

Alt text

Images upload directly to Supabase Storage.

Show upload progress.

Allow:
- drag & drop
- multi-upload
- preview
- delete
- reorder

==================================================
6. PRODUCT EDITOR
==================================================

Create a polished product editor.

Sections:

BASIC INFORMATION

Product Name
Slug
SKU
Category
Status

PRICING

Price
Compare-at Price
Currency

DESCRIPTION

Short Description
Full Description

PRODUCT DETAILS

Material
Dimensions
Weight
Closure
Lining

VARIANTS

Color
Size
SKU
Price
Stock

MEDIA

Product gallery

SEO

SEO title
SEO description
OG image

==================================================
7. HERO / CAMPAIGN MANAGER
==================================================

THIS IS ONE OF THE MOST IMPORTANT FEATURES.

The homepage hero is currently designed as a swipe-based luxury handbag advertising experience.

Admin must be able to create and manage hero slides.

Example:

Campaign 1
Campaign 2
Campaign 3
Campaign 4

Each slide should have:

Title
Subtitle
Description
CTA text
CTA URL

Desktop image
Mobile image

Active / inactive

Sort order

Start date
End date

==================================================
8. HERO VISUAL EDITING
==================================================

The admin should NOT need to modify code.

If the hero currently contains:

IMAGE
+
HEADING
+
SUBHEADING
+
CTA
+
PRODUCT
+
DECORATIVE ELEMENTS

the admin should be able to change the editable content.

Example:

Current:

"Carry Your Story"

Admin changes it to:

"New Season, New Icon"

and the live website updates.

Admin changes:

Hero image
↓
new image

The website automatically uses the new image.

==================================================
9. HERO PREVIEW
==================================================

Create live preview.

Admin can see:

Desktop Preview
Mobile Preview

before publishing.

Preview should use the exact storefront hero component.

Do NOT create a separate fake preview implementation.

Use the actual frontend component with preview data.

==================================================
10. HERO SWIPE ORDER
==================================================

Admin can drag:

Campaign 1
Campaign 2
Campaign 3
Campaign 4

to reorder them.

The storefront mobile swipe hero should follow exactly that order.

==================================================
11. HOMEPAGE CMS
==================================================

Create a visual homepage content manager.

Admin should be able to control:

Announcement bar
Hero
What's New
Featured Products
Promotional Banner
Editorial sections
Collections
Brand story
Testimonials
Social gallery
Footer

==================================================
12. SECTION VISIBILITY
==================================================

Each homepage section must have:

Visible / Hidden

Example:

What's New
[ON]

Brand Story
[OFF]

Social Gallery
[ON]

The storefront automatically reflects this.

==================================================
13. SECTION ORDER
==================================================

Admin should be able to drag sections:

Hero
↓
What's New
↓
Featured Collection
↓
Editorial
↓
Brand Story

Change order without code.

The frontend renders sections according to this order.

==================================================
14. EDIT TEXT EVERYWHERE
==================================================

IMPORTANT:

The admin should eventually be able to change editable website text without touching code.

Examples:

Announcement text
Hero title
Hero subtitle
Hero CTA
Section heading
Section description
Banner text
Brand story
Footer text

DO NOT hardcode CMS-controlled text in React components.

Keep layout/design in code.

Keep editable content in Supabase.

==================================================
15. EDIT IMAGES EVERYWHERE
==================================================

Any major marketing image that appears on the storefront should be manageable from the admin panel.

Examples:

Hero image
Campaign image
Editorial image
Collection image
Brand story image
Social image
Banner image

Admin selects:

Replace Image

uploads a new image to Supabase Storage.

The frontend automatically displays it.

==================================================
16. MEDIA LIBRARY
==================================================

Create:

/admin/media

Admin can see all uploaded media.

Show:

Thumbnail
File name
Type
Usage
Upload date

Allow:

Upload
Delete
Search
Filter

Do not allow deleting media that is actively required by published content without confirmation.

==================================================
17. CATEGORIES
==================================================

Admin can:

Create
Edit
Archive
Reorder

categories.

Each category:

Name
Slug
Description
Image
Visibility

==================================================
18. INVENTORY
==================================================

Admin can see:

Product
SKU
Stock
Status

Highlight low-stock products.

Allow quick stock update.

==================================================
19. ORDERS
==================================================

Build order management UI.

Columns:

Order ID
Customer
Date
Items
Total
Payment Status
Order Status

Order detail page:

Customer information
Products
Quantities
Price snapshots
Shipping address
Payment information
Order timeline

Admin can update:

Pending
Confirmed
Processing
Shipped
Delivered
Cancelled

Do NOT implement payment gateway yet.

==================================================
20. REVIEWS
==================================================

Admin can:

Approve
Reject
Delete

reviews.

Show:

Customer
Product
Rating
Review
Date
Status

==================================================
21. SETTINGS
==================================================

Admin can edit:

Brand name
Logo
Favicon
Announcement bar
Contact email
Phone
Social links
Shipping text
Return policy
Footer text

==================================================
22. SEO SETTINGS
==================================================

Admin can manage:

Homepage SEO title
Homepage description
Default OG image

Product-level SEO already exists in product editor.

==================================================
23. DRAFT / PUBLISH SYSTEM
==================================================

For CMS content, support:

Draft
Published

Admin should be able to:

Save Draft

then:

Publish

Do not immediately publish every accidental edit if a draft workflow is practical.

==================================================
24. SECURITY
==================================================

VERY IMPORTANT:

Admin panel must not simply hide buttons.

Server/database must prevent unauthorized users from:

creating products
editing products
uploading media
editing homepage content
editing hero campaigns
changing prices
changing inventory

Use Supabase RLS.

==================================================
25. RESPONSIVE ADMIN
==================================================

Admin should work on:

Desktop
Tablet

Mobile should remain usable but desktop is the priority.

==================================================
26. STOREFRONT INTEGRATION
==================================================

After admin updates:

PRODUCT PRICE
→ product page updates

PRODUCT IMAGE
→ product page updates

HERO IMAGE
→ hero updates

HERO TEXT
→ hero updates

HERO ORDER
→ swipe order updates

HOMEPAGE SECTION
→ homepage updates

SECTION VISIBILITY
→ section appears/disappears

This must be real database-driven functionality.

Do NOT create fake local-only admin state.

==================================================
27. CACHE REVALIDATION
==================================================

When admin publishes a change:

Revalidate affected storefront pages/data.

Examples:

Product update
→ invalidate that product page

Hero update
→ invalidate homepage hero

Homepage section update
→ invalidate homepage

Do not require users to manually hard refresh the website.

Use the existing free/native caching strategy.

Do NOT introduce Redis or a paid caching layer.

==================================================
28. DO NOT CHANGE THE DESIGN
==================================================

The storefront already has a luxury editorial design.

Do NOT redesign it.

Admin panel should control content.

Admin panel should NOT control arbitrary CSS/layout.

The design remains developer-controlled.

CMS controls:

CONTENT
IMAGES
PRODUCTS
PRICES
CAMPAIGNS
ORDER
VISIBILITY
ORDERING

==================================================
29. FINAL TEST
==================================================

Test the complete workflow:

Admin login

↓

Admin dashboard

↓

Create product

↓

Upload 6 product photographs

↓

Publish product

↓

Open storefront

↓

Product appears

↓

Click product

↓

PDP opens

↓

Change product price in admin

↓

Storefront price updates

↓

Change product primary image

↓

Storefront updates

↓

Create hero campaign

↓

Upload hero image

↓

Add title/subtitle/CTA

↓

Publish

↓

Homepage hero updates

↓

Create second hero

↓

Reorder hero campaigns

↓

Mobile swipe follows new order

↓

Hide homepage section

↓

Section disappears from storefront

Everything must work using Supabase.

No fake/mock admin data.
l
No local-only CMS.

No backend other than Supabase.