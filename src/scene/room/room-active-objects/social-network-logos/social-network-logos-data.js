const SOCIAL_NETWORK_LOGOS_PART_TYPE = {
  GithubFront: 'github-front',
  GithubBack: 'github-back',
  LinkedinFront: 'linkedin-front',
  LinkedinBack: 'linkedin-back',
}

const SOCIAL_NETWORK_LOGOS_PART_ACTIVITY_CONFIG = {
  [SOCIAL_NETWORK_LOGOS_PART_TYPE.GithubFront]: true,
  [SOCIAL_NETWORK_LOGOS_PART_TYPE.GithubBack]: true,
  [SOCIAL_NETWORK_LOGOS_PART_TYPE.LinkedinFront]: true,
  [SOCIAL_NETWORK_LOGOS_PART_TYPE.LinkedinBack]: true,
}

const GITHUB_PARTS = [
  SOCIAL_NETWORK_LOGOS_PART_TYPE.GithubFront,
  SOCIAL_NETWORK_LOGOS_PART_TYPE.GithubBack,
]

const LINKEDIN_PARTS = [
  SOCIAL_NETWORK_LOGOS_PART_TYPE.LinkedinFront,
  SOCIAL_NETWORK_LOGOS_PART_TYPE.LinkedinBack,
]

export {
  SOCIAL_NETWORK_LOGOS_PART_TYPE,
  SOCIAL_NETWORK_LOGOS_PART_ACTIVITY_CONFIG,
  GITHUB_PARTS,
  LINKEDIN_PARTS,
};
