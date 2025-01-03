interface ContributionDay {
  color: string;
  contributionCount: number;
  contributionLevel: string;
  date: string;
}

interface Week {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  colors: string[];
  weeks: Week[];
}

const API_URL = Deno.env.get("CI") ? "http://localhost:8000" : "https://api.github.com/graphql";

const getContributions = async (useCache: boolean, user: string, from?: string, to?: string) => {
  const cache = await caches.open("gh-api");

  const cacheKey = `${API_URL}/${user}/${from}/${to}`;
  const cached = await cache.match(cacheKey);
  if (useCache && cached) return await cached.json();

  const token = Deno.env.get("GH_READ_USER_TOKEN");
  const query = `
    query($user:String! $from:DateTime $to:DateTime) {
      user(login: $user){
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            colors
            isHalloween
            weeks {
              contributionDays {
                color
                contributionCount
                contributionLevel
                date
              }
            }
          }
        }
      }
    }
  `;

  const variables = { user, from, to };
  const json = { query, variables };
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-type": "application/json" },
    body: JSON.stringify(json),
  });

  if (useCache && res.ok && from && to) {
    await cache.put(cacheKey, res.clone());
  }

  return await res.json();
};

export { getContributions };
export type { ContributionCalendar, ContributionDay, Week };
