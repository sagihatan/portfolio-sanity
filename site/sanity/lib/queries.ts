import { defineQuery } from 'next-sanity'

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project"] | order(order asc) {
    _id,
    order,
    name,
    subtext,
    iconLabel,
    iconAsset,
    accentColor,
    tags,
    tileSize,
    artVariant,
    image
  }
`)

export const TESTIMONIALS_QUERY = defineQuery(`
  *[_type == "testimonial"] | order(order asc) {
    _id,
    order,
    name,
    role,
    headline,
    body,
    avatar
  }
`)

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0] {
    showHeroStage,
    "heroStageVideoUrl": heroStageVideo.asset->url
  }
`)
