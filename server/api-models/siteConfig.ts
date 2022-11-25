export interface SiteConfig {
  clientId: string,
  organization?: {
    id: number,
    title: string,
  },
  brand?: {
    primary?: string,
  }
}