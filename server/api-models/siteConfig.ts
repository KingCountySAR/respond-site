export interface SiteConfig {
  clientId: string,
  organization?: {
    title: string
  },
  brand?: {
    primary?: string,
  }
}