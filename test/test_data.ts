import { SketchPrimitive } from "../dist";

export const test_params: Map<string, number> = new Map([
    [
        "e~2~contour_reference~0,2~x",
        0
    ],
    [
        "e~2~contour_reference~0,2~y",
        0
    ],
    [
        "e~2~contour_reference~r,2~x",
        600
    ],
    [
        "e~2~contour_reference~r,2~y",
        0
    ],
    [
        "e~2~contour_reference~tr,2~x",
        600
    ],
    [
        "e~2~contour_reference~tr,2~y",
        600
    ],
    [
        "e~2~contour_reference~t,2~x",
        0
    ],
    [
        "e~2~contour_reference~t,2~y",
        600
    ],
    [
        "radrad",
        120
    ],
    [
        "(- 360 / 5) * PI / 180",
        -1.2566370614359172
    ],
    [
        "(360 / 5) * PI / 180",
        1.2566370614359172
    ]
]);

export const test_sketch: SketchPrimitive[] = [
    {
        "x": 0,
        "y": 0,
        "id": 0,
        "type": "point",
        "fixed": false
    },
    {
        "x": 70.6383091165866,
        "y": 97.00633631443648,
        "id": 1,
        "type": "point",
        "fixed": false
    },
    {
        "id": 2,
        "type": "line",
        "p1_id": 0,
        "p2_id": 1
    },
    {
        "x": 0,
        "y": 0,
        "id": 3,
        "type": "point",
        "fixed": false
    },
    {
        "id": 4,
        "type": "equal",
        "param1": {
            "o_id": 3,
            "prop": "x"
        },
        "param2": "e~2~contour_reference~0,2~x"
    },
    {
        "id": 5,
        "type": "equal",
        "param1": {
            "o_id": 3,
            "prop": "y"
        },
        "param2": "e~2~contour_reference~0,2~y"
    },
    {
        "id": 6,
        "type": "p2p_coincident",
        "p1_id": 3,
        "p2_id": 0
    },
    {
        "x": 0,
        "y": 0,
        "id": 7,
        "type": "point",
        "fixed": false
    },
    {
        "x": 114.08694624470006,
        "y": -37.20441770218855,
        "id": 8,
        "type": "point",
        "fixed": false
    },
    {
        "id": 9,
        "type": "line",
        "p1_id": 7,
        "p2_id": 8
    },
    {
        "id": 10,
        "type": "p2p_coincident",
        "p1_id": 0,
        "p2_id": 7
    },
    {
        "x": 0,
        "y": 0,
        "id": 11,
        "type": "point",
        "fixed": false
    },
    {
        "x": -0.128698664679758,
        "y": -119.99993098603728,
        "id": 12,
        "type": "point",
        "fixed": false
    },
    {
        "id": 13,
        "type": "line",
        "p1_id": 11,
        "p2_id": 12
    },
    {
        "id": 14,
        "type": "p2p_coincident",
        "p1_id": 3,
        "p2_id": 11
    },
    {
        "x": 0,
        "y": 0,
        "id": 15,
        "type": "point",
        "fixed": false
    },
    {
        "x": -114.16648639377887,
        "y": -36.95961829482422,
        "id": 16,
        "type": "point",
        "fixed": false
    },
    {
        "id": 17,
        "type": "line",
        "p1_id": 15,
        "p2_id": 16
    },
    {
        "id": 18,
        "type": "p2p_coincident",
        "p1_id": 3,
        "p2_id": 15
    },
    {
        "x": 0,
        "y": 0,
        "id": 19,
        "type": "point",
        "fixed": false
    },
    {
        "x": -70.43007030282797,
        "y": 97.15763066861352,
        "id": 20,
        "type": "point",
        "fixed": false
    },
    {
        "id": 21,
        "type": "line",
        "p1_id": 19,
        "p2_id": 20
    },
    {
        "id": 22,
        "type": "p2p_coincident",
        "p1_id": 3,
        "p2_id": 19
    },
    {
        "x": 70.6383091165866,
        "y": 97.00633631443648,
        "id": 23,
        "type": "point",
        "fixed": false
    },
    {
        "x": 111.27866625485387,
        "y": 64.50602244111687,
        "id": 24,
        "type": "point",
        "fixed": false
    },
    {
        "x": 22.607398088141522,
        "y": 117.02983790551185,
        "id": 25,
        "type": "point",
        "fixed": false
    },
    {
        "id": 26,
        "c_id": 23,
        "type": "arc",
        "end_id": 25,
        "radius": 52.03757325423817,
        "start_id": 24,
        "end_angle": 2.7466131138940972,
        "start_angle": -0.6745612944459864
    },
    {
        "id": 27,
        "a_id": 26,
        "type": "arc_rules"
    },
    {
        "id": 28,
        "type": "p2p_coincident",
        "p1_id": 1,
        "p2_id": 23
    },
    {
        "x": 114.08694624470006,
        "y": -37.20441770218855,
        "id": 29,
        "type": "point",
        "fixed": false
    },
    {
        "x": 93.81300554994262,
        "y": -85.13015566098959,
        "id": 30,
        "type": "point",
        "fixed": false
    },
    {
        "x": 127.97008624699728,
        "y": 12.947027480047408,
        "id": 31,
        "type": "point",
        "fixed": false
    },
    {
        "id": 32,
        "c_id": 29,
        "type": "arc",
        "end_id": 31,
        "radius": 52.03757325423817,
        "start_id": 30,
        "end_angle": 1.3007348470080784,
        "start_angle": -1.970995693103771
    },
    {
        "id": 33,
        "a_id": 32,
        "type": "arc_rules"
    },
    {
        "id": 34,
        "type": "p2p_coincident",
        "p1_id": 8,
        "p2_id": 29
    },
    {
        "x": -0.128698664679758,
        "y": -119.99993098603728,
        "id": 35,
        "type": "point",
        "fixed": false
    },
    {
        "x": -52.13679343251588,
        "y": -118.24861467823317,
        "id": 36,
        "type": "point",
        "fixed": false
    },
    {
        "x": 51.72585156634008,
        "y": -115.63935183541473,
        "id": 37,
        "type": "point",
        "fixed": false
    },
    {
        "id": 38,
        "c_id": 35,
        "type": "arc",
        "end_id": 37,
        "radius": 52.03757325423817,
        "start_id": 36,
        "end_angle": 0.0838951227940283,
        "start_angle": -3.1752538520498543
    },
    {
        "id": 39,
        "a_id": 38,
        "type": "arc_rules"
    },
    {
        "id": 40,
        "type": "p2p_coincident",
        "p1_id": 12,
        "p2_id": 35
    },
    {
        "x": -114.16648639377887,
        "y": -36.95961829482422,
        "id": 41,
        "type": "point",
        "fixed": false
    },
    {
        "x": -133.5150636794428,
        "y": 11.347126443471826,
        "id": 42,
        "type": "point",
        "fixed": false
    },
    {
        "x": -96.53447664526054,
        "y": -85.91900209832362,
        "id": 43,
        "type": "point",
        "fixed": false
    },
    {
        "id": 44,
        "c_id": 41,
        "type": "arc",
        "end_id": 43,
        "radius": 52.03757325423817,
        "start_id": 42,
        "end_angle": -1.2251208411317225,
        "start_angle": -4.33142085207869
    },
    {
        "id": 45,
        "a_id": 44,
        "type": "arc_rules"
    },
    {
        "id": 46,
        "type": "p2p_coincident",
        "p1_id": 16,
        "p2_id": 41
    },
    {
        "x": -70.43007030282797,
        "y": 97.15763066861352,
        "id": 47,
        "type": "point",
        "fixed": false
    },
    {
        "x": -22.35631982721938,
        "y": 117.07806102036864,
        "id": 48,
        "type": "point",
        "fixed": false
    },
    {
        "x": -114.53672232981403,
        "y": 69.54400582216189,
        "id": 49,
        "type": "point",
        "fixed": false
    },
    {
        "id": 50,
        "c_id": 47,
        "type": "arc",
        "end_id": 49,
        "radius": 52.03757325423817,
        "start_id": 48,
        "end_angle": -2.582227963974722,
        "start_angle": -5.890350745639758
    },
    {
        "id": 51,
        "a_id": 50,
        "type": "arc_rules"
    },
    {
        "id": 52,
        "type": "p2p_coincident",
        "p1_id": 20,
        "p2_id": 47
    },
    {
        "id": 53,
        "type": "equal_radius_cc",
        "c1_id": 26,
        "c2_id": 32
    },
    {
        "id": 54,
        "type": "equal_radius_cc",
        "c1_id": 50,
        "c2_id": 32
    },
    {
        "id": 55,
        "type": "equal_radius_cc",
        "c1_id": 44,
        "c2_id": 32
    },
    {
        "id": 56,
        "type": "equal_radius_cc",
        "c1_id": 38,
        "c2_id": 32
    },
    {
        "id": 57,
        "type": "p2p_distance",
        "p1_id": 1,
        "p2_id": 0,
        "distance": "radrad"
    },
    {
        "id": 58,
        "type": "p2p_distance",
        "p1_id": 0,
        "p2_id": 8,
        "distance": "radrad"
    },
    {
        "id": 59,
        "type": "p2p_distance",
        "p1_id": 11,
        "p2_id": 12,
        "distance": "radrad"
    },
    {
        "id": 60,
        "type": "p2p_distance",
        "p1_id": 15,
        "p2_id": 16,
        "distance": "radrad"
    },
    {
        "id": 61,
        "type": "p2p_distance",
        "p1_id": 19,
        "p2_id": 20,
        "distance": "radrad"
    },
    {
        "id": 62,
        "type": "l2l_angle_ll",
        "angle": "(- 360 / 5) * PI / 180",
        "l1_id": 21,
        "l2_id": 2
    },
    {
        "id": 63,
        "type": "l2l_angle_ll",
        "angle": "(- 360 / 5) * PI / 180",
        "l1_id": 2,
        "l2_id": 9
    },
    {
        "id": 64,
        "type": "l2l_angle_ll",
        "angle": "(- 360 / 5) * PI / 180",
        "l1_id": 9,
        "l2_id": 13
    },
    {
        "id": 65,
        "type": "l2l_angle_ll",
        "angle": "(360 / 5) * PI / 180",
        "l1_id": 17,
        "l2_id": 13
    },
    {
        "x": 0.13556060490239996,
        "y": 126.39807315163378,
        "id": 66,
        "type": "point",
        "fixed": false
    },
    {
        "x": -22.35631982721938,
        "y": 117.07806102036864,
        "id": 67,
        "type": "point",
        "fixed": false
    },
    {
        "x": 22.607398088141522,
        "y": 117.02983790551185,
        "id": 68,
        "type": "point",
        "fixed": false
    },
    {
        "id": 69,
        "c_id": 66,
        "type": "arc",
        "end_id": 68,
        "radius": 24.346402434441767,
        "start_id": 67,
        "end_angle": -0.3949795396956961,
        "start_angle": -2.748758092049964
    },
    {
        "id": 70,
        "a_id": 69,
        "type": "arc_rules"
    },
    {
        "id": 71,
        "type": "p2p_coincident",
        "p1_id": 25,
        "p2_id": 68
    },
    {
        "id": 72,
        "type": "p2p_coincident",
        "p1_id": 48,
        "p2_id": 67
    },
    {
        "x": 136.63052800409443,
        "y": 44.232001193712726,
        "id": 73,
        "type": "point",
        "fixed": false
    },
    {
        "x": 111.27866625485387,
        "y": 64.50602244111687,
        "id": 74,
        "type": "point",
        "fixed": false
    },
    {
        "x": 127.97008624699728,
        "y": 12.947027480047408,
        "id": 75,
        "type": "point",
        "fixed": false
    },
    {
        "id": 76,
        "c_id": 73,
        "type": "arc",
        "end_id": 75,
        "radius": 32.46155929238153,
        "start_id": 74,
        "end_angle": -1.8408578065817152,
        "start_angle": -3.81615394803578
    },
    {
        "id": 77,
        "a_id": 76,
        "type": "arc_rules"
    },
    {
        "id": 78,
        "type": "p2p_coincident",
        "p1_id": 31,
        "p2_id": 75
    },
    {
        "id": 79,
        "type": "p2p_coincident",
        "p1_id": 24,
        "p2_id": 74
    },
    {
        "x": 81.9831106925453,
        "y": -113.09494304750883,
        "id": 80,
        "type": "point",
        "fixed": false
    },
    {
        "x": 93.81300554994262,
        "y": -85.13015566098959,
        "id": 81,
        "type": "point",
        "fixed": false
    },
    {
        "x": 51.72585156634008,
        "y": -115.63935183541473,
        "id": 82,
        "type": "point",
        "fixed": false
    },
    {
        "id": 83,
        "c_id": 80,
        "type": "arc",
        "end_id": 82,
        "radius": 30.364053515798936,
        "start_id": 81,
        "end_angle": 3.2254877763838214,
        "start_angle": 1.170596960486022
    },
    {
        "id": 84,
        "a_id": 83,
        "type": "arc_rules"
    },
    {
        "id": 85,
        "type": "p2p_coincident",
        "p1_id": 37,
        "p2_id": 82
    },
    {
        "id": 86,
        "type": "p2p_coincident",
        "p1_id": 30,
        "p2_id": 81
    },
    {
        "x": -85.29353453790195,
        "y": -117.13209730395293,
        "id": 87,
        "type": "point",
        "fixed": false
    },
    {
        "x": -52.13679343251588,
        "y": -118.24861467823317,
        "id": 88,
        "type": "point",
        "fixed": false
    },
    {
        "x": -96.53447664526054,
        "y": -85.91900209832362,
        "id": 89,
        "type": "point",
        "fixed": false
    },
    {
        "id": 90,
        "c_id": 87,
        "type": "arc",
        "end_id": 89,
        "radius": 33.17553453641204,
        "start_id": 88,
        "end_angle": 1.9164718124580704,
        "start_angle": -0.03366119846006086
    },
    {
        "id": 91,
        "a_id": 90,
        "type": "arc_rules"
    },
    {
        "id": 92,
        "type": "p2p_coincident",
        "p1_id": 43,
        "p2_id": 89
    },
    {
        "id": 93,
        "type": "p2p_coincident",
        "p1_id": 36,
        "p2_id": 88
    },
    {
        "x": -148.34674619892917,
        "y": 48.376738023189084,
        "id": 94,
        "type": "point",
        "fixed": false
    },
    {
        "x": -133.5150636794428,
        "y": 11.347126443471826,
        "id": 95,
        "type": "point",
        "fixed": false
    },
    {
        "x": -114.53672232981403,
        "y": 69.54400582216189,
        "id": 96,
        "type": "point",
        "fixed": false
    },
    {
        "id": 97,
        "c_id": 94,
        "type": "arc",
        "end_id": 96,
        "radius": 39.88948407918518,
        "start_id": 95,
        "end_angle": 0.5593646896150717,
        "start_angle": -1.189828198488897
    },
    {
        "id": 98,
        "a_id": 97,
        "type": "arc_rules"
    },
    {
        "id": 99,
        "type": "p2p_coincident",
        "p1_id": 49,
        "p2_id": 96
    },
    {
        "id": 100,
        "type": "p2p_coincident",
        "p1_id": 42,
        "p2_id": 95
    },
    {
        "id": 101,
        "p_id": 25,
        "type": "angle_via_point",
        "angle": 3.141592653589793,
        "crv1_id": 26,
        "crv2_id": 69
    },
    {
        "id": 102,
        "p_id": 74,
        "type": "angle_via_point",
        "angle": 3.141592653589793,
        "crv1_id": 76,
        "crv2_id": 26
    },
    {
        "id": 103,
        "p_id": 31,
        "type": "angle_via_point",
        "angle": 3.141592653589793,
        "crv1_id": 32,
        "crv2_id": 76
    },
    {
        "id": 104,
        "p_id": 30,
        "type": "angle_via_point",
        "angle": 3.141592653589793,
        "crv1_id": 32,
        "crv2_id": 83
    },
    {
        "id": 105,
        "p_id": 37,
        "type": "angle_via_point",
        "angle": 3.141592653589793,
        "crv1_id": 38,
        "crv2_id": 83
    },
    {
        "id": 106,
        "p_id": 88,
        "type": "angle_via_point",
        "angle": 3.141592653589793,
        "crv1_id": 90,
        "crv2_id": 38
    },
    {
        "id": 107,
        "p_id": 43,
        "type": "angle_via_point",
        "angle": 3.141592653589793,
        "crv1_id": 44,
        "crv2_id": 90
    },
    {
        "id": 108,
        "p_id": 95,
        "type": "angle_via_point",
        "angle": 3.141592653589793,
        "crv1_id": 97,
        "crv2_id": 44
    },
    {
        "id": 109,
        "p_id": 96,
        "type": "angle_via_point",
        "angle": 3.141592653589793,
        "crv1_id": 97,
        "crv2_id": 50
    },
    {
        "id": 110,
        "p_id": 67,
        "type": "angle_via_point",
        "angle": 3.141592653589793,
        "crv1_id": 69,
        "crv2_id": 50
    },
    {
        "type": "equal",
        "param1": {
            "o_id": 0,
            "prop": "x"
        },
        "param2": 140.45986045398124,
        "id": 111,
        "temporary": true
    },
    {
        "type": "equal",
        "param1": {
            "o_id": 73,
            "prop": "y"
        },
        "param2": 46.439024466827085,
        "id": 112,
        "temporary": true
    },
    {
        "type": "circle_radius",
        "id": 113,
        "c_id": 76,
        "radius": 32.46155929238153,
        "temporary": true,
        "scale": 0.01
    },
    {
        "type": "difference",
        "id": 114,
        "param1": {
            "o_id": 73,
            "prop": "x"
        },
        "param2": {
            "o_id": 74,
            "prop": "x"
        },
        "difference": -29.18119419912736,
        "temporary": true,
        "scale": 0.01
    },
    {
        "type": "difference",
        "id": 115,
        "param1": {
            "o_id": 73,
            "prop": "y"
        },
        "param2": {
            "o_id": 74,
            "prop": "y"
        },
        "difference": 18.066997974289784,
        "temporary": true,
        "scale": 0.01
    },
    {
        "type": "difference",
        "id": 116,
        "param1": {
            "o_id": 73,
            "prop": "x"
        },
        "param2": {
            "o_id": 75,
            "prop": "x"
        },
        "difference": -12.489774206983952,
        "temporary": true,
        "scale": 0.01
    },
    {
        "type": "difference",
        "id": 117,
        "param1": {
            "o_id": 73,
            "prop": "y"
        },
        "param2": {
            "o_id": 75,
            "prop": "y"
        },
        "difference": -33.491996986779675,
        "temporary": true,
        "scale": 0.01
    }
];