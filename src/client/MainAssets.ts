import { PlayerAnimationStateMessage, GameMessages } from "../common/types";

type AssetsMap = { [id: string]: any }

type AudioTagMap = { [id in keyof typeof PlayerAnimationStateMessage]?: AFrameAudioTag }

type AudioGameExtras = { [id in keyof typeof GameMessages]?: AFrameAudioTag }


export 
interface DefaultAssets {
    characters: AssetsMap;
    music?: AssetsMap;
    audio?: AudioTagMap & AudioGameExtras;

}

export
interface AFrameAudioTag {
    src: string;
    autoplay?: boolean;
    volume?: number;
    positional?: boolean;
    uuid?:string;
}


// TODO generate uuid for each asset to be able to reference it directly in code
export 
const GameAssets: DefaultAssets = {
    characters: {
        steve: {
            src: "/assets/characters/minecraft-steve.glb"
        },
        jasper: {
            src: "/assets/characters/jasper.glb"
        },
        claire: {
            src: "/assets/characters/claire.glb"
        }
    },
    music: {
        eightBitHeroes: [
            "/assets/audio/8-Bit Heroes/Daydream Anatomy - 8-Bit Heroes - 01 Combat.mp3",
            "/assets/audio/8-Bit Heroes/Daydream Anatomy - 8-Bit Heroes - 02 8-Bit Bomber.mp3",
            "/assets/audio/8-Bit Heroes/Daydream Anatomy - 8-Bit Heroes - 03 Nin10day.mp3",
            "/assets/audio/8-Bit Heroes/Daydream Anatomy - 8-Bit Heroes - 04 Struggle.mp3",
            "/assets/audio/8-Bit Heroes/Daydream Anatomy - 8-Bit Heroes - 05 Our Hero's Funeral March.mp3",
            "/assets/audio/8-Bit Heroes/Daydream Anatomy - 8-Bit Heroes - 06 Dragon Slayer.mp3"
        ]
    },
    audio: {
        jump: {
            src: "assets/audio/interaction/rubber_ball_bounce_dirt_01.mp3",
            autoplay: false,
            volume: 8,
            positional: false
        },
        dying: {
            src: "assets/audio/interaction/Bullet_Impact_Metal_Hard_Clang.mp3",
            autoplay: false,
            volume: 2,
            positional: false

        },
        dance: {
            src: "assets/audio/interaction/hl2-button3.wav",
            autoplay: false,
            volume: 2,
            positional: false

        },
        spawn:{
            src: "assets/audio/misc/friendonline.wav",
            autoplay: false,
            volume: 2,
            positional: false

        },
        despawn:{
            src: "assets/audio/misc/bodydrop1.wav",
            autoplay: false,
            volume: 2,
            positional: false

        },


    }
}

