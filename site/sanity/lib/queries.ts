import { defineQuery } from 'next-sanity'

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project"] | order(order asc) {
    _id,
    order,
    name,
    subtext,
    iconLabel,
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
