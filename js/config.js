const CONFIG_URL = 'config.json';

let cachedConfig = null;

export async function loadConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const response = await fetch(CONFIG_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to load config: ' + response.status);
    }
    cachedConfig = await response.json();
  } catch (error) {
    console.warn('[config] Falling back to default content.', error);
    cachedConfig = getDefaultConfig();
  }

  return cachedConfig;
}

function getDefaultConfig() {
  return {
    site: {
      title: 'Liew Cheah Ming — Portfolio',
      description: 'Portfolio of Liew Cheah Ming — AI projects and works.'
    },
    hero: {
      name: 'Liew Cheah Ming',
      image: 'assets/images/profile/myimage.png',
      headline: 'Exploring intelligent systems and thoughtful product experiences.'
    },
    about: {
      summary: [
        'I build data-driven and ML-powered solutions focused on delightful, intuitive user outcomes.',
        'My current interests span reinforcement learning, optimization, and resilient web experiences across devices.'
      ]
    },
    infiniteMenu: {
      items: ['Python', 'PyTorch', 'Optimization', 'Reinforcement Learning', 'Computer Vision', 'React', 'Git', 'Docker', 'SQL', 'Arduino', 'AI']
    },
    socials: [],
    projects: []
  };
}

export function getMetaElements() {
  return {
    title: document.querySelector('title'),
    description: document.querySelector('meta[name="description"]')
  };
}
