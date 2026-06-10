export interface SiteSettings {
  id: string
  logo_url: string
  favicon_url: string
  primary_color: string
  heading_color: string
  font_family: string
  site_name: string
  tagline: string
  // Top bar
  top_bar_enabled: boolean
  top_bar_reg_no: string
  // Contact info
  address: string
  phone: string
  email: string
  whatsapp: string
  // Social links
  facebook_url: string
  youtube_url: string
  instagram_url: string
  map_embed_url: string
  // Footer
  footer_description: string
  footer_copyright: string
  // Header donate button
  donate_button_text: string
  donate_button_link: string
  // Registered office
  office_address: string
  office_emails: string
  // Contact person
  contact_person_name: string
  contact_person_role: string
  contact_person_email: string
  contact_person_phone: string
  contact_person_landline: string
  // Mail notifications
  notification_email: string
  notify_on_contact: boolean
  notify_on_donation: boolean
  // Razorpay live key (public-safe key id only)
  razorpay_key_id: string
  // Payment gateways — comma-separated enabled list e.g. "razorpay,qr"
  payment_gateway: string
  billdesk_merchant_id: string
  billdesk_env: 'uat' | 'production'
  donation_qr_url: string
  updated_at: string
}

export interface TopBarQuote {
  id: string
  quote_text: string
  is_active: boolean
  sort_order: number
}

export interface NavItem {
  id: string
  label: string
  path: string
  parent_id: string | null
  sort_order: number
  is_active: boolean
  is_button: boolean
  open_in_new: boolean
  children?: NavItem[]
}

export interface SliderItem {
  id: string
  title: string
  description: string
  button_text: string
  button_link: string
  image_url: string
  sort_order: number
  is_active: boolean
}

export interface GalleryAlbum {
  id: string
  title: string
  description: string
  cover_image_url: string
  created_at: string
  is_active: boolean
  images?: GalleryImage[]
}

export interface GalleryImage {
  id: string
  album_id: string
  image_url: string
  caption: string
  sort_order: number
}

export interface Testimonial {
  id: string
  name: string
  designation: string
  quote: string
  image_url: string
  is_active: boolean
  sort_order: number
}

export interface PageContent {
  id: string
  page_key: string
  section_key: string
  title: string
  content: string
  image_url: string
  updated_at: string
}

export interface Program {
  id: string
  title: string
  description: string
  icon: string
  sort_order: number
  is_active: boolean
}

export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  image_url: string
  sort_order: number
  is_active: boolean
}

export interface Donation {
  id: string
  name: string
  email: string
  phone: string
  amount: number
  razorpay_order_id: string
  razorpay_payment_id: string
  status: string
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  created_at: string
  is_read: boolean
}
