import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase, useGSAP);

CustomEase.create('meres.out', '0.16, 1, 0.3, 1'); // settling (expo-out feel)
CustomEase.create('meres.inOut', '0.65, 0, 0.35, 1'); // panels, wipes, page transitions
CustomEase.create('meres.soft', '0.33, 1, 0.68, 1'); // small UI, hovers

gsap.defaults({ ease: 'meres.out' });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText, Flip, CustomEase, useGSAP };
