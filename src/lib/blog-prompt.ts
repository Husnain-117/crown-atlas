import { readFileSync } from 'fs'
import { join } from 'path'
import { BLOG_DRAFT_INSTRUCTIONS } from './blog-editorial'

let PROMPT_CACHE: string | null = null

export function BLOG_PROMPT_VIA_FILE() {
  if (PROMPT_CACHE) return PROMPT_CACHE
  const p = join(process.cwd(), 'src', 'lib', 'blog', 'prompt-template.txt')
  try {
    PROMPT_CACHE = `${readFileSync(p, 'utf8')}\n${BLOG_DRAFT_INSTRUCTIONS}`
    return PROMPT_CACHE
  } catch {
    return `Prepare a real estate editorial draft. ${BLOG_DRAFT_INSTRUCTIONS}`
  }
}

export default BLOG_PROMPT_VIA_FILE
