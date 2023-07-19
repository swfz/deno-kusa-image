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
  weeks: Week[];
}

const getContributions = async (user: string) => {
  const token = Deno.env.get("GH_READ_USER_TOKEN");
  const query = `
    query($user:String!) {
      user(login: $user){
        contributionsCollection {
          contributionCalendar {
            totalContributions
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
  const url = "https://api.github.com/graphql";
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(json),
  });

  // const decoder = new TextDecoder("utf-8");
  // const file = await Deno.readFile("contributions.json");
  // const data = JSON.parse(decoder.decode(file));
  // return data;
  return res.json();
};

export { getContributions };
export type { ContributionCalendar, ContributionDay, Week };
