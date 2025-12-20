export type Person = {
  login: string;
  avatar: string;
  url?: string;
};

export type Contributor = Person;
export type Sponsor = Person;

export type Organization = {
  owner: Person;
  members: Person[];
};
