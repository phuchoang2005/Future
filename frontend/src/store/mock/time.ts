const now = new Date();

export const iso = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60_000).toISOString();
