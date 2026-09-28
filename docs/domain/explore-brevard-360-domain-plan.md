# Explore Brevard 360 — Public Domain & Link Architecture

**Record ID:** EB360-DOMAIN-001  
**Version:** v1.0.0  
**Owner-selected public name:** Explore Brevard 360  
**Selected domain:** `explorebrevard360.com`  
**Availability check:** AVAILABLE at time of Namecheap check on 2026-09-28  
**Observed first-year purchase price at check:** USD $11.28  
**Registration state:** NOT YET CONFIRMED / NOT YET OWNED

Availability is not ownership. The domain becomes controlled by the project only after successful registrar purchase and DNS configuration.

## Canonical public links after domain activation

| Purpose | Public URL | Current repository target |
|---|---|---|
| Main world / home | https://explorebrevard360.com/ | /client/ via root entry |
| World alias | https://explorebrevard360.com/world/ | /client/ |
| Founding business intake | https://explorebrevard360.com/join/ | /tommie/founding-intake.html |
| Founding business alias | https://explorebrevard360.com/founding/ | /tommie/founding-intake.html |
| Business information | https://explorebrevard360.com/business/ | /tommie/#founding-businesses |
| General contact | https://explorebrevard360.com/contact/ | /tommie/contact.html?mode=message |
| Book / request appointment | https://explorebrevard360.com/book/ | /tommie/contact.html?mode=book |
| About Explore Brevard | https://explorebrevard360.com/about/ | /tommie/explore-brevard.html#about |
| Tommie / Human Systems Architect hub | https://explorebrevard360.com/tommie/ | /tommie/ |

## Routing policy

- Public-facing messages should use the shortest human-readable route that matches the task.
- Business outreach should use `/join/`.
- General promotion should use the root domain.
- Do not expose repository paths unless needed for technical evidence.
- Existing GitHub Pages URLs remain valid fallback infrastructure until the custom domain is fully activated.
- Do not rewrite historical receipts or evidence to pretend the custom domain existed before activation.

## Deferred until registration is confirmed

Do **not** add a GitHub Pages `CNAME` file or switch public copy to the custom domain until the domain is actually purchased and DNS control is available.

After purchase:
1. configure registrar DNS for GitHub Pages;
2. configure `explorebrevard360.com` as the GitHub Pages custom domain;
3. add the repository `CNAME` record if required by the Pages configuration;
4. wait for DNS propagation / certificate provisioning;
5. enforce HTTPS when GitHub reports the certificate ready;
6. verify every route above on mobile;
7. then update outreach templates and public copy from the GitHub Pages fallback URL to the custom domain.

## Future reserved route families

These are naming reservations only. Do not publish them until the corresponding functionality exists.

- `/directory/` — business directory
- `/events/` — public events layer
- `/sponsor/` — sponsor/investor information
- `/business/<slug>/` — direct business destinations
- `/world/<place>/` — direct world-place routes if the runtime later supports stable deep links

Reality ≠ Representation: reserving a route name does not mean the feature exists.
