import { Organization } from '@/features/Legal/credits/types';

// hard-coded list because everyone here has the 'organization visibility' set to private
// to fetch them I would need to add a KEY but i don't want :)
export const ORGANIZATION: Organization = {
  owner: {
    login: 'tentoumushii',
    avatar: 'https://avatars.githubusercontent.com/u/169354375?v=4',
    url: 'https://github.com/tentoumushii'
  },
  members: [
    {
      login: 'hanserlodev',
      avatar: 'https://avatars.githubusercontent.com/u/236074685?v=4',
      url: 'https://github.com/hanserlodev'
    },
    {
      login: 'gentrit04',
      avatar: 'https://avatars.githubusercontent.com/u/113774327?v=4',
      url: 'https://github.com/gentrit04'
    },
    {
      login: 'Alekoii',
      avatar: 'https://avatars.githubusercontent.com/u/92536005?v=4',
      url: 'https://github.com/Alekoii'
    },
    {
      login: 'iamtensaii',
      avatar: 'https://avatars.githubusercontent.com/u/70672364?v=4',
      url: 'https://github.com/iamtensaii'
    },
    {
      login: 'martin-rojas-web',
      avatar: 'https://avatars.githubusercontent.com/u/169834778?v=4',
      url: 'https://github.com/martin-rojas-web'
    },
    {
      login: 'Bruception',
      avatar: 'https://avatars.githubusercontent.com/u/58147810?v=4',
      url: 'https://github.com/Bruception'
    },
    {
      login: 'rizwanmustafa',
      avatar: 'https://avatars.githubusercontent.com/u/69350358?v=4',
      url: 'https://github.com/rizwanmustafa'
    },
    {
      login: 'Theelx',
      avatar: 'https://avatars.githubusercontent.com/u/43764914?v=4',
      url: 'https://github.com/Theelx'
    }
  ]
};
