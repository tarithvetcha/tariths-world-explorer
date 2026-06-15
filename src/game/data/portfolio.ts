/**
 * Single source of truth for portfolio content. Edit here to update the site.
 * Videos are CDN-hosted asset pointers; replace the .asset.json contents to swap clips.
 */
import car from "@/assets/videos/car.asset.json";
import headphone from "@/assets/videos/headphone.asset.json";
import project1 from "@/assets/videos/project1.asset.json";
import project2 from "@/assets/videos/project2.asset.json";
import project3 from "@/assets/videos/project3.asset.json";

export const PROFILE = {
  name: "Tarith Vetcha",
  tagline: "Aspiring Gameplay Programmer · CSE Undergrad · Builder of Worlds",
  education:
    "B.Tech in Computer Science & Engineering — completed 2nd semester, entering 3rd.",
  interests: [
    "Gameplay Programming",
    "Unreal Engine 5",
    "AR / VR",
    "AI & Machine Learning",
    "Blender / 3D",
    "Creative Technology",
  ],
  personal:
    "Peaceful soul, curious learner, and a cricketer since the age of 5. I build things because they're fun to build.",
  mission:
    "Become an exceptional Gameplay Programmer — blending Game Development with AI, AR and VR.",
  contact: {
    github: "Updates coming soon — repos go live once I'm back on campus.",
    linkedin: "https://www.linkedin.com/in/tarith-vetcha-46198b378/",
    email: "tarithvetcha2008@gmail.com",
  },
};

export const EXPERIENCE = {
  title: "Industry-level UE5 / AR / VR Training",
  body: `Since my very first semester I've been part of a continuous Unreal Engine 5, AR and VR workshop series run by an external industry agency. The curriculum is not "intro tutorials" — it's the same workflows used in production studios.`,
  learned: [
    "Level Design & Landscape Sculpting",
    "Lighting & Post-Processing",
    "Blueprint Visual Scripting",
    "Gameplay Logic & Interaction Systems",
    "Animation Systems & Sequencer",
    "MetaHumans & Character Setup",
    "UI / HUD Programming",
    "Day/Night Systems",
    "Basic AI Behaviors",
    "Performance Optimization",
    "Project Organization",
  ],
  next: ["Active VR Development", "Advanced C++ Gameplay", "Networking", "Shader Programming"],
};

export interface Project {
  id: string;
  title: string;
  status: "shipped" | "solo" | "in-development";
  blurb: string;
  role: string[];
  tech: string[];
  challenges: string;
  future: string;
  video?: { url: string };
  confidential?: boolean;
}

export const PROJECTS: Project[] = [
  {
    id: "marine",
    title: "Marine Survivor (Central Govt. Educational Project)",
    status: "shipped",
    confidential: true,
    blurb:
      "A government-commissioned educational game about marine ecosystems. A survivor crash-lands on an island and must reach the ocean — interacting with marine species through MCQ-driven dialogue to unlock more of the world.",
    role: [
      "Full island environment — landscape, sculpting, foliage, detailing",
      "MetaHuman protagonist setup & near-photoreal movement",
      "Day/Night cycle, Health system, HUD",
      "Dynamic water integration",
      "Animal NPC placement & behavior hooks",
    ],
    tech: ["Unreal Engine 5", "MetaHumans", "FAB Assets", "Blueprints", "Dynamic Water"],
    challenges:
      "Hitting near-photoreal visuals while keeping the island playable at full scale — most of the work was lighting, LOD tuning and culling discipline.",
    future:
      "Wider ecosystem coverage and deeper interaction loops once the next phase opens up.",
    video: { url: project1.url },
  },
  {
    id: "maze",
    title: "Maze Runner",
    status: "solo",
    blurb:
      "A solo third-person maze runner. Collect every coin before the timer runs out — and don't touch the bombs. Built entirely from Blueprints with a full HUD and day/night cycle.",
    role: [
      "Designed and built end-to-end, solo",
      "Coin & bomb interaction logic",
      "Timer, Coin Counter, Victory / Game-Over HUDs",
      "Day/Night cycle",
    ],
    tech: ["Unreal Engine 5", "Blueprints", "FAB Assets"],
    challenges:
      "Balancing timer length vs. maze complexity so it stays tense without feeling unfair.",
    future:
      "Procedural maze generation, multiple themed levels, smarter bomb AI, and deeper polish on game-feel.",
    video: { url: project2.url },
  },
  {
    id: "action",
    title: "Action Adventure (Untitled)",
    status: "in-development",
    blurb:
      "An in-development action-adventure with a three-person team. Focus is survival, combat against NPC enemies, exploration and inventory systems.",
    role: ["Gameplay systems", "NPC behavior", "Combat prototyping"],
    tech: ["Unreal Engine 5", "Blueprints", "C++ (planned)"],
    challenges:
      "Coordinating a small team, scoping responsibly, and keeping a consistent vision while learning new systems.",
    future: "Inventory, ability system, enemy variety, full level pass.",
    video: { url: project3.url },
  },
];

export const BLENDER_RENDERS = [
  {
    id: "headphone",
    title: "Apple-styled Headphone Commercial",
    blurb:
      "My first complete 3D project. Modeled, lit, animated and edited solo — with stereo audio and a commercial-grade cut.",
    url: headphone.url,
  },
  {
    id: "car",
    title: "Tokyo Night Car Render",
    blurb:
      "A stylized cinematic car render set in nighttime Tokyo. Raw footage — no color grading, just the lighting doing the work.",
    url: car.url,
  },
];

export const AI_ROADMAP = {
  title: "AI Research Lab",
  intro:
    "I'm not pretending to be an AI expert — I'm an enthusiastic learner building this in parallel with Game Dev.",
  roadmap: [
    { label: "Python", state: "doing" },
    { label: "Mathematics for ML", state: "doing" },
    { label: "Classical Machine Learning", state: "next" },
    { label: "Deep Learning", state: "next" },
    { label: "Computer Vision", state: "later" },
    { label: "LLMs", state: "later" },
    { label: "PyTorch / TensorFlow", state: "later" },
  ],
};

export const ARVR = {
  title: "AR / VR Innovation Lab",
  body:
    "AR training is complete. VR training is nearing the end of its curriculum — once finished, I move into active VR project development. The long-term goal is building genuinely immersive VR gameplay experiences.",
};
