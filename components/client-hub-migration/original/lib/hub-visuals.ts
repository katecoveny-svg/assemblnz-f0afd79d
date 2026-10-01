import type {Sector} from "./concept-engine";
import type {Hub} from "./pursuit-hub";
import {currentArtDirection,directionBrief,creativeBrandContext,livingReferenceDirection} from "./creative-direction";
import {buyerImage} from "./client-studios";

export const hubVisuals:Record<Sector,{title:string;subject:string;poster:string;legacy:string[];film:boolean}>={
 grocery:{title:"A week, assembled",subject:"Fresh household ingredients, a grocery basket and blank recipe cards assembling into a weekly meal plan",poster:"/cinematic/nadir-grocery.jpg",legacy:["/cinematic/concept-grocery.webp"],film:true},
 trade:{title:"A project, prepared",subject:"Timber, hand tools, screws and a project sheet assembling into a precise project kit",poster:"/cinematic/nadir-trade.jpg",legacy:["/cinematic/concept-trade.webp"],film:true},
 travel:{title:"A journey, ready",subject:"A travel folio, aircraft scale model, luggage tag and travel case assembling into a trip-readiness arrangement",poster:"/cinematic/nadir-travel.jpg",legacy:["/cinematic/concept-travel.webp"],film:true},
 manufacturing:{title:"The farm conversation, assembled",subject:"A dairy tanker scale model, stainless storage modules, dairy cartons and blank farmer-record cards assembling into a service handoff",poster:"/cinematic/nadir-manufacturing.jpg",legacy:["/cinematic/assembl-brief.png"],film:true},
 government:{title:"A public service, made clear",subject:"Blue and ivory folders, blank application cards and glass information panes assembling around a miniature public-service counter",poster:"/cinematic/nadir-government.jpg",legacy:["/cinematic/assembl-brief.png"],film:true},
 school:{title:"Learning spaces, taking shape",subject:"Timber classroom modules, roof panels, a courtyard and landscape strips assembling into an illustrative school campus",poster:"/cinematic/nadir-school.jpg",legacy:["/cinematic/concept-school.webp"],film:true},
 village:{title:"A village, taking shape",subject:"Low-rise homes, a community pavilion, gardens and broad paths assembling around an illustrative retirement-village courtyard",poster:"/cinematic/nadir-village.jpg",legacy:["/cinematic/architecture.png"],film:true},
 works:{title:"The proposed works, in view",subject:"Bridge-deck and road segments, public paths, structural modules and blank site-plan sheets assembling into a civil-infrastructure staging model",poster:"/cinematic/nadir-works.jpg",legacy:["/cinematic/architecture.png"],film:false},
 custom:{title:"Your client's world",subject:"Objects specifically drawn from the supplied client offering and customer journey; establish that subject before generating imagery",poster:"/cinematic/nadir-coast.jpg",legacy:["/cinematic/assembl-brief.png"],film:false},
};

export const nadirDirection="Premium cinematic aerial photography; true 90-degree overhead drone framing, generous negative space, precise materials and directional natural light. Show the client's actual world: food, ingredients, distribution, travel or project components assembling into a useful outcome. Use that client's reviewed palette and relevant objects. assembl's sheep, rivers, coastlines, forests and brand films must never be a default for another client's campaign. Do not substitute the presenter's palette for the buyer's. No tourism postcards, decorative cultural motifs, stock-photo feel, generic networks, unrelated objects, fake results, text or baked-in logos. Motion, when commissioned, must explain the task and resolve into the customer's next step. A photograph is not a generated film.";

export function hubVisualBrief(h:Hub):string{
 const sector=h.engine?.sector||"custom",visual=hubVisuals[sector];
 const direction=currentArtDirection(h),concept=h.engine?.concepts.find(c=>c.id===h.engine?.selected);
 return `${creativeBrandContext(h)}${livingReferenceDirection}\nTask: ${(concept?.agent||h.offer).slice(0,350)}. Outcome: ${(concept?.promise||h.offer).slice(0,300)}. ${direction?directionBrief(direction):`Relevant subject: ${visual.subject}. ${nadirDirection}`} Original proposed illustration; no relationship, live integration, issued design or operational result is implied.`;
}

export function cinemaArtwork(h:Hub):string{
 const visual=hubVisuals[h.engine?.sector||"custom"],src=h.design.frame.artwork?.src;
 const preset=!src||Object.values(hubVisuals).some(v=>v.poster===src||v.legacy.includes(src))||/^\/cinematic\/(?:nadir-(?:coast|river)|assembl-(?:brief|form))\.(?:png|jpg|webp)$/.test(src);
 if(preset){const buyer=buyerImage(h.buyer);if(buyer)return buyer;if(/^sap(?:\s|$)/i.test(h.seller))return "/cinematic/studio-sap-aerial.jpg";if(/^assembl$/i.test(h.seller))return "/cinematic/assembl-plum-aerial.jpg";}
 return !src||visual.legacy.includes(src)?visual.poster:src;
}

export function isPresetArtwork(h:Hub):boolean{
 const visual=hubVisuals[h.engine?.sector||"custom"],src=h.design.frame.artwork?.src;
 if(cinemaArtwork(h)!==visual.poster)return false;
 return !src||src===visual.poster||visual.legacy.includes(src);
}
