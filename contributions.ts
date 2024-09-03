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

const getContributions = async (user: string, to?: string) => {
  const token = Deno.env.get("GH_READ_USER_TOKEN");
  const query = `
    query($user:String!) {
      user(login: $user){
        contributionsCollection${to ? `(to:"${to}T00:00:00")` : ""} {
          contributionCalendar {
            totalContributions
            colors
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

  const variables = { user };
  const json = { query, variables };
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-type": "application/json" },
    body: JSON.stringify(json),
  });

  return res.json();
};

export { getContributions };
export type { ContributionCalendar, ContributionDay, Week };
