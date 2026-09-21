import React, { useId } from "react";
const Tree = ({ x = 0, y = 0, s = 1, c = "#254e42", pine = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 0 2-56 5-56 7 0Z" fill="#3f4936" />
    {pine ? (
      <>
        <path d="M-19-15 3-63 25-15-10-26 3-81 18-39 3-91-13-40Z" fill={c} />
        <path d="M3-81 3-19 20-17Z" fill="#142f2b" opacity=".4" />
      </>
    ) : (
      <>
        <path
          d="M-25-27Q-43-43-22-57Q-28-80-8-80Q5-103 19-81Q42-76 35-56Q55-35 29-22Q7-11-25-27Z"
          fill={c}
        />
        <path
          d="M-27-55Q-32-73-8-76Q5-95 21-77L9-63Z"
          fill="#82a16a"
          opacity=".3"
        />
        <path
          d="M3-3V-62M3-34-12-48M3-44 18-62"
          stroke="#293c30"
          strokeWidth="3"
          fill="none"
        />
      </>
    )}
  </g>
);
function Tower({ x, y, s = 1, roof = "#455548" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-19 0V-76H18V0Z" fill="#b8af8e" />
      <path d="M1 0V-76H18V0" fill="#8f967b" />
      <path d="M-22-76 0-115 23-76Z" fill={roof} />
      <path d="M0-115 6-82 23-76Z" fill="#263f39" opacity=".4" />
      <path d="M-23-77H23M-21-73H21" stroke="#d1bd93" strokeWidth="2" />
      <path d="M-6-51V-61Q0-69 6-61V-51Z" fill="#3b5147" />
      <path d="M-6-25V-35Q0-43 6-35V-25Z" fill="#344a40" />
      <path
        d="M0-114V-138L22-133 0-125"
        fill="#c2a269"
        stroke="#6c7157"
        strokeWidth="1.5"
      />
      <path
        d="M-16-4H-6M6-43H16M-17-39H-8M8-15H17"
        stroke="#74836b"
        opacity=".5"
      />
    </g>
  );
}
function Castle() {
  return (
    <g>
      <path
        d="M785 292 772 239 816 221 850 226 893 196 949 226 993 222 1020 264 1004 295Z"
        fill="#7d8a6a"
      />
      <path
        d="M806 258V159L850 145 892 170 946 139 977 163V266Z"
        fill="#c1b291"
      />
      <path d="M858 264V153L892 170 902 260" fill="#969a7c" />
      <path d="M792 166 827 119 878 161 848 178Z" fill="#586352" />
      <path d="M907 155 941 114 986 154 948 170Z" fill="#435a4a" />
      <path d="M831 265V219Q851 193 870 219V265" fill="#3c5143" />
      <path d="M840 260V221Q851 208 862 221V260" fill="#253f35" />
      <path
        d="M809 191h12v21h-12zm68 0h12v21h-12zm54-14h12v21h-12zm22 12h10v19h-10z"
        fill="#465e4b"
      />
      <Tower x={802} y={263} s={0.9} />
      <Tower x={974} y={267} s={1.04} />
      <Tower x={890} y={214} s={1.4} roof="#3d554b" />
      <Tower x={939} y={250} s={0.73} />
      <path
        d="M779 268V244H787V235H795V244H809V235H817V244H831V235H839V244H849V268M875 269V246H885V237H893V246H907V237H915V246H929V237H937V246H950V237H958V246H987V268"
        fill="#a7a487"
        stroke="#7f8b70"
        strokeWidth="1"
      />
      <path
        d="M851 264Q844 300 900 321L889 335Q819 303 836 264"
        fill="#b4aa81"
      />
      <path
        d="M854 269Q850 294 881 310"
        fill="none"
        stroke="#d0c299"
        strokeWidth="3"
        opacity=".5"
      />
    </g>
  );
}
export function WorldArt({ className = "" }) {
  const u = useId().replaceAll(":", "");
  return (
    <svg
      className={className}
      viewBox="0 0 1200 420"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="An ancient hilltop stronghold overlooking a misty, forested valley at golden dawn"
    >
      <defs>
        <linearGradient id={`${u}s`} x2="0" y2="1">
          <stop stopColor="#8c9c81" />
          <stop offset=".57" stopColor="#c9bd91" />
          <stop offset="1" stopColor="#5c8370" />
        </linearGradient>
        <linearGradient id={`${u}h`} x2="0" y2="1">
          <stop stopColor="#1d3931" />
          <stop offset="1" stopColor="#122922" />
        </linearGradient>
        <radialGradient id={`${u}sun`}>
          <stop stopColor="#e4d29f" stopOpacity=".8" />
          <stop offset="1" stopColor="#dbcba1" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}shade`}>
          <stop stopColor="#142726" />
          <stop offset=".37" stopColor="#142726" stopOpacity=".88" />
          <stop offset=".7" stopColor="#142726" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1200" height="420" fill={`url(#${u}s)`} />
      <ellipse cx="810" cy="85" rx="350" ry="220" fill={`url(#${u}sun)`} />
      <circle cx="786" cy="74" r="28" fill="#e0cf9e" opacity=".6" />
      <path
        d="M0 167 124 82 161 106 226 49 336 149 433 75 512 130 615 43 719 134 810 92 943 183 1066 77 1197 143V324H0Z"
        fill="#8f9f88"
        opacity=".8"
      />
      <path
        d="m391 196 129-127 122 142 116-67 98 71 144-96 91 102 108-44v159H365Z"
        fill="#758d77"
      />
      <path
        d="m469 123 51-54 51 59-38-18-13-13-21 26Z"
        fill="#c5c4a3"
        opacity=".5"
      />
      <path
        d="M0 249Q125 164 241 226T459 207Q590 140 697 234T894 210Q1057 143 1200 223V420H0Z"
        fill="#5f806b"
      />
      <path
        d="M-10 311Q165 235 321 273T564 248Q665 206 762 267Q956 308 1200 237V420H0Z"
        fill="#456954"
      />
      <path
        d="M542 251Q787 261 734 310T942 404L856 431Q623 353 682 319T517 265"
        fill="#89a397"
      />
      <path
        d="M553 257Q739 271 713 300M721 324Q662 345 820 389"
        fill="none"
        stroke="#c3c2a0"
        strokeWidth="2"
        opacity=".4"
      />
      <path
        d="M742 321 752 280 791 262 827 271 893 257 946 272 1001 263 1049 312 1080 346 955 372 826 349Z"
        fill="#65775a"
      />
      <path
        d="m786 300-11 25 27 17 25-40 17 30 38 17 30-49 23 65 44 8 25-58-34-26-49-18Z"
        fill="#829071"
        opacity=".75"
      />
      <path
        d="m814 290-14 45m67-58-20 57m84-56 22 64m40-30 21 37"
        stroke="#3f5d48"
        strokeWidth="4"
        opacity=".5"
      />
      <g transform="translate(0 60) scale(1 .78)">
        <Castle />
      </g>
      {[
        [754, 280, 0.6],
        [777, 288, 0.42],
        [1017, 284, 0.7],
        [1055, 298, 0.85],
        [1113, 308, 1],
        [726, 275, 0.38],
        [1069, 262, 0.6],
        [1150, 307, 0.95],
        [980, 294, 0.33],
        [1031, 312, 0.45],
        [813, 300, 0.27],
      ].map(([x, y, s], i) => (
        <Tree key={i} x={x} y={y} s={s} c={i % 2 ? "#345a44" : "#486c4e"} />
      ))}
      <path
        d="M0 348Q178 271 389 335Q586 307 656 420H0ZM836 420Q971 325 1200 337V420Z"
        fill={`url(#${u}h)`}
      />
      {[
        [42, 368, 2],
        [158, 324, 1.4],
        [238, 359, 1.9],
        [1169, 377, 2],
        [1080, 405, 1.1],
        [610, 408, 0.68],
        [362, 384, 1],
        [476, 414, 0.8],
      ].map(([x, y, s], i) => (
        <Tree
          key={i}
          x={x}
          y={y}
          s={s}
          c={i % 2 ? "#254936" : "#1f402f"}
          pine
        />
      ))}
      <g stroke="#344e3a" fill="none" strokeWidth="2">
        <path d="m677 99 8-4 8 3m29 18 7-4 8 2m297-34 7-3 7 4m-18 8 5-3 5 2" />
      </g>
      <g fill="#c6b981" opacity=".7">
        {[
          [658, 345],
          [952, 325],
          [994, 352],
          [679, 373],
          [539, 349],
          [1038, 339],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.7" />
        ))}
      </g>
      <rect width="1200" height="420" fill={`url(#${u}shade)`} />
      <path d="M0 419H1200" stroke="#6c8766" opacity=".3" />
    </svg>
  );
}
function Hut({ x = 0, y = 0, s = 1, roof = "#777c68" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="m-37-2 0-42 37-17 38 19v41L0 19Z" fill="#b2a88a" />
      <path d="m0-59 38 18v40L0 19Z" fill="#817e65" />
      <path d="m-47-41 40-42 54 38L5-24Z" fill={roof} />
      <path d="m-7-83 8 49 46-11Z" fill="#354d43" opacity=".45" />
      <path d="M-26-15v-19l12-5v19Zm37 17v-25l14 7v25Z" fill="#344438" />
      <path
        d="M-35-46 5-27 42-43M-25-56 10-36M-14-68 21-43"
        fill="none"
        stroke="#9b9a76"
        strokeWidth="2"
        opacity=".45"
      />
      <path d="M-39-4 0 16 39-3" fill="none" stroke="#d0ba8d" strokeWidth="2" />
    </g>
  );
}
export function BuildingArt({ type, className = "" }) {
  const u = useId().replaceAll(":", "");
  const magical = ["spire", "sanctum", "observatory"].includes(type);
  return (
    <svg
      className={className}
      viewBox="0 0 300 160"
      role="img"
      aria-label={`Illustration of ${type}`}
    >
      <defs>
        <radialGradient id={`${u}g`}>
          <stop stopColor={magical ? "#344951" : "#3a5145"} />
          <stop offset="1" stopColor="#1d302b" stopOpacity=".05" />
        </radialGradient>
        <linearGradient id={`${u}rock`} x2=".7" y2="1">
          <stop stopColor="#969c88" />
          <stop offset="1" stopColor="#4a6153" />
        </linearGradient>
        <linearGradient id={`${u}crystal`}>
          <stop stopColor="#abc8d8" />
          <stop offset=".5" stopColor="#769fb9" />
          <stop offset="1" stopColor="#63709a" />
        </linearGradient>
      </defs>
      <ellipse cx="150" cy="90" rx="136" ry="89" fill={`url(#${u}g)`} />
      <ellipse cx="151" cy="139" rx="90" ry="13" fill="#0e211e" opacity=".4" />
      <path d="m62 127 40-19 100 1 36 22-76 24Z" fill="#465b42" />
      <path d="m62 127 1 7 99 24 76-21v-6l-76 21Z" fill="#293f31" />
      {[
        [60, 120, 0.6],
        [221, 124, 0.75],
        [87, 112, 0.38],
      ].map(([x, y, s], i) => (
        <Tree
          key={i}
          x={x}
          y={y}
          s={s}
          c={i === 1 ? "#4a6950" : "#3e624a"}
          pine={type === "mine" || type === "lumber"}
        />
      ))}
      {type === "keep" ? (
        <g transform="translate(-86 -55) scale(.92)">
          <path d="M227 198V124H282V201Z" fill="#9c9d7e" />
          <path d="m220 126 31-31 38 28Z" fill="#61765b" />
          <Tower x={213} y={200} s={0.78} />
          <Tower x={286} y={206} s={0.7} />
          <Tower x={251} y={161} s={0.8} />
          <path d="M244 202v-29q10-18 20 0v29" fill="#273e32" />
          <path
            d="M202 202v-16h6v-6h6v6h12v-6h6v6h11v16m23 0v-16h10v-6h6v6h13v-6h6v6h6v16"
            fill="#adb08a"
          />
        </g>
      ) : null}
      {type === "lumber" ? (
        <g>
          <Hut x={145} y={112} s={0.87} roof="#89916b" />
          <path d="m105 131 37-20 39 13-37 20Z" fill="#867456" />
          <path
            d="M103 126v9m10-15v9m12-15v9"
            stroke="#544b37"
            strokeWidth="9"
          />
          <path
            d="m106 128 41-22m-28 26 41-22m-28 27 41-22"
            stroke="#a6976d"
            strokeWidth="8"
          />
          <path
            d="m106 128 41-22m-28 26 41-22m-28 27 41-22"
            stroke="#5e6245"
            strokeWidth="2"
          />
          <path d="m183 119 17-6 13 7-17 8Z" fill="#a19063" />
          <path d="m197 115 4-31" stroke="#807150" strokeWidth="4" />
          <path d="m199 88 2-14 11 8-2 10Z" fill="#a6b3a1" />
        </g>
      ) : null}
      {type === "quarry" ? (
        <g>
          <path
            d="m86 119 8-40 27-28 28 17 22-29 31 33 13 54-57 22Z"
            fill={`url(#${u}rock)`}
          />
          <path
            d="m121 51 1 43-25 32 44-13 8-45m22-29-3 50 34-17-16 50 29 4"
            fill="#b6b79c"
            opacity=".3"
          />
          <path
            d="m96 80 26 14 46-5 18 33m-45-9 27-24"
            stroke="#3e5549"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="m125 122 20-16 21 9-7 23-32-5Zm56 11 10-15 16 8-2 11Z"
            fill="#a1a18b"
          />
          <path d="m188 116-29-50" stroke="#8e7954" strokeWidth="5" />
          <path d="M141 75q13-23 36-14l-19 6Z" fill="#c0bc9a" />
          <path d="m89 127 15-11 11 6-5 15Z" fill="#788d72" />
        </g>
      ) : null}
      {type === "mine" ? (
        <g>
          <path
            d="m88 121 10-44 24-28 29 10 13-23 34 38 14 51-58 21Z"
            fill={`url(#${u}rock)`}
          />
          <path
            d="m122 49-2 37 24-12 7-15m13-23-2 41 22-3 21 36-7-36"
            fill="#bac0a0"
            opacity=".25"
          />
          <path d="m127 127 0-34 17-17 33 10 8 34Z" fill="#142b26" />
          <path
            d="m121 130 3-38 20-20 38 12 10 39"
            stroke="#887857"
            strokeWidth="8"
            fill="none"
          />
          <path
            d="m130 128 5-33 13-13 25 7 10 33"
            stroke="#b1a178"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="m145 117-31 25m54-23-24 30"
            stroke="#8c977f"
            strokeWidth="3"
          />
          <path
            d="m126 137 29 7m-20-15 26 7m-18-14 25 7"
            stroke="#665f48"
            strokeWidth="3"
          />
          <path d="m164 115 18-9 17 6-6 14-16 4Z" fill="#5c6a57" />
          <circle cx="177" cy="131" r="4" fill="#243e32" />
          <circle cx="191" cy="125" r="4" fill="#243e32" />
          <path d="m168 109 5-11 7 6 4-9 8 10-11 9Z" fill="#c1a366" />
          <rect x="133" y="93" width="5" height="9" rx="2" fill="#dbb36c" />
        </g>
      ) : null}
      {magical ? (
        <g>
          <ellipse cx="149" cy="126" rx="39" ry="14" fill="#6d8a82" />
          <ellipse
            cx="149"
            cy="122"
            rx="32"
            ry="11"
            fill="#aac0b4"
            opacity=".45"
          />
          {type === "sanctum" ? (
            <>
              <ellipse cx="149" cy="118" rx="27" ry="10" fill="#619f9c" />
              <ellipse cx="149" cy="114" rx="22" ry="7" fill="#a8ddd0" />
              <path
                d="M124 114 117 83M174 114 180 83"
                stroke="#889e85"
                strokeWidth="6"
              />
              <path
                d="M115 81q34-34 67 0"
                stroke="#a6b49b"
                strokeWidth="7"
                fill="none"
              />
              <circle cx="150" cy="77" r="8" fill="#c8e5ca" />
            </>
          ) : (
            <>
              <path d="m132 122 5-63h23l8 64Z" fill="#8b9e92" />
              <path d="m149 60 11-1 8 64-17 7Z" fill="#5f7973" />
              <path d="m124 65 25-12 27 12-27 12Z" fill="#99b3a5" />
              <path d="m136 48 14-32 14 32-14 14Z" fill={`url(#${u}crystal)`} />
              <path d="m150 16 0 46 14-14Z" fill="#cee6e7" opacity=".5" />
              <ellipse
                cx="150"
                cy="45"
                rx="30"
                ry="10"
                fill="none"
                stroke="#92bab8"
                opacity=".5"
                transform="rotate(-20 150 45)"
              />
            </>
          )}
          {[
            [105, 73],
            [184, 53],
            [126, 37],
            [169, 92],
            [153, 8],
          ].map(([x, y], i) => (
            <path
              key={i}
              d={`M${x - 2} ${y}h4m-2-2v4`}
              stroke="#b3d4c7"
              opacity=".7"
            />
          ))}
        </g>
      ) : null}
      {["guild", "warehouse", "academy"].includes(type) ? (
        <g>
          <Hut
            x={157}
            y={116}
            s={1.2}
            roof={
              type === "guild"
                ? "#a0885d"
                : type === "academy"
                  ? "#6c7993"
                  : "#718668"
            }
          />
          <path d="m149 127 0-24 13-5 0 23Z" fill="#c2a36a" />
          <path
            d="M180 93V41L203 48 180 55"
            stroke="#9a9a78"
            strokeWidth="2"
            fill="#b4a069"
          />
          {type === "warehouse" ? (
            <>
              <path d="m99 117 18-8 15 9v17l-18 7-15-10Z" fill="#9e8a5f" />
              <path
                d="m99 118 15 8 18-8m-18 8v16"
                stroke="#584e37"
                fill="none"
              />
              <path
                d="m107 113 17 10m-25 5 16 7 17-7"
                stroke="#c3ad78"
                fill="none"
              />
            </>
          ) : (
            <path
              d="m192 116 10-5 10 5v16l-11 9-9-9Z"
              fill="#8f9c79"
              stroke="#c1b181"
              strokeWidth="2"
            />
          )}
        </g>
      ) : null}
      <g fill="#84936a" opacity=".6">
        <path d="m72 133 3-10 3 12m130-1 3-9 3 7m-28 16 2-8 3 7" />
      </g>
    </svg>
  );
}
export function HeroArt({ hero, className = "" }) {
  const u = useId().replaceAll(":", ""),
    h = hero,
    elf = h.art === "elf",
    dwarf = h.art === "dwarf",
    mage = h.art === "mage",
    rogue = h.art === "rogue",
    healer = h.art === "healer",
    knight = h.art === "knight";
  return (
    <svg
      className={className}
      viewBox="0 0 240 280"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Portrait of ${h.name}`}
    >
      <defs>
        <linearGradient id={`${u}bg`} x2=".7" y2="1">
          <stop stopColor={h.color} />
          <stop offset="1" stopColor="#1a2b2c" />
        </linearGradient>
        <linearGradient id={`${u}skin`} x2="1" y2=".2">
          <stop stopColor={h.skin} />
          <stop offset="1" stopColor="#9c7563" />
        </linearGradient>
        <linearGradient id={`${u}armor`} x2=".6" y2="1">
          <stop stopColor={h.color} />
          <stop offset="1" stopColor="#253a37" />
        </linearGradient>
      </defs>
      <rect width="240" height="280" fill={`url(#${u}bg)`} />
      <circle
        cx="120"
        cy="109"
        r="83"
        fill="none"
        stroke="#d2cba4"
        opacity=".15"
      />
      <circle
        cx="120"
        cy="109"
        r="70"
        fill="none"
        stroke="#d2cba4"
        opacity=".1"
      />
      <path
        d="M20 280V105Q20 10 120 10T220 105V280"
        fill="none"
        stroke="#d6c7a0"
        opacity=".15"
      />
      <g fill="#e5d5aa" opacity=".25">
        <path d="m37 39 3-6 3 6-3 6Zm157 120 3-6 3 6-3 6Z" />
        <circle cx="191" cy="58" r="1.5" />
        <circle cx="48" cy="143" r="1" />
      </g>
      <path
        d="M41 280 47 217Q54 192 91 178L89 135 146 129 151 176Q194 187 200 220L218 280"
        fill="#263a36"
      />
      {mage || elf || healer ? (
        <path
          d="M73 184Q49 153 61 100Q63 45 116 42Q169 42 177 95L185 205 142 182 105 169Z"
          fill={mage ? "#d0c1b2" : healer ? "#b7a981" : "#483f34"}
        />
      ) : null}
      {rogue ? (
        <path
          d="M57 174Q52 89 77 58Q126 24 164 65Q190 106 181 184L140 207Z"
          fill="#323b46"
        />
      ) : null}
      <path d="m95 165 2 29 23 26 27-28-7-40Z" fill={`url(#${u}skin)`} />
      {elf ? (
        <>
          <path
            d="m82 114-27-21 14 45 22 9m65-33 29-21-16 46-20 6"
            fill={h.skin}
          />
          <path
            d="m62 105 14 24m100-24-13 22"
            stroke="#a7806b"
            strokeWidth="3"
          />
        </>
      ) : (
        <>
          <ellipse cx="81" cy="122" rx="10" ry="17" fill={h.skin} />
          <ellipse cx="158" cy="122" rx="9" ry="17" fill="#a47d67" />
        </>
      )}
      <path
        d={
          dwarf
            ? "M76 88Q120 66 161 91L163 141Q160 175 124 187Q85 178 76 145Z"
            : "M81 84Q123 54 160 86L155 139Q146 165 123 177Q98 167 85 143Z"
        }
        fill={`url(#${u}skin)`}
      />
      <path d="m123 101-8 36 14 4 7-5" fill="#ab7f69" opacity=".6" />
      <path
        d="m87 109 21-4 3 5-23 3m45-6 18 4 1 5-23-5"
        fill={dwarf ? "#655044" : "#63534a"}
      />
      <path d="m89 119 18-1-7 5Zm44-1 17 3-10 3Z" fill="#eee0c3" />
      <path
        d="M101 118v5m38-3v4"
        stroke={elf ? "#466b51" : "#394743"}
        strokeWidth="4"
      />
      <path
        d="m110 153 13 2 12-4"
        fill="none"
        stroke="#805c53"
        strokeWidth="2"
      />
      <path d="m87 130 20 5-14 6m44-6 15-6-7 12" fill="#dcb29b" opacity=".45" />
      {dwarf ? (
        <>
          <path
            d="M76 124 94 147 117 140 143 147 161 122 167 171 153 204 122 224 88 202 71 169Z"
            fill="#7e6650"
          />
          <path
            d="m86 155 8 37 21 14-9-45m37-6-9 49 17-22 8-38"
            fill="#a48c67"
          />
          <path d="m105 150 15-8 23 7-13 10-11-3-14 5-16-5Z" fill="#b39b74" />
          <path d="m94 189 11 5m31 2 10-4" stroke="#d0b270" strokeWidth="5" />
          <path
            d="M73 103Q65 72 83 57L148 55Q175 75 164 103L144 80 111 88 92 80Z"
            fill="#7c674f"
          />
        </>
      ) : null}
      {knight ? (
        <>
          <path
            d="M76 116 73 87Q74 48 119 47Q162 47 167 81L162 119 153 89 129 82 98 92 86 108Z"
            fill="#554e42"
          />
          <path d="M83 83Q109 54 150 65L129 72Z" fill="#81755a" />
          <path
            d="m92 146 19 14 21-1 15-13-7 22-18 11-22-13Z"
            fill="#685849"
            opacity=".7"
          />
        </>
      ) : null}
      {elf ? (
        <>
          <path
            d="M69 118Q58 56 108 42Q162 35 173 80L164 109 148 74Q111 99 81 96Z"
            fill="#66533f"
          />
          <path d="M76 78Q118 42 160 67Q126 49 106 82Z" fill="#a28a5e" />
          <path
            d="M73 91 95 85 120 94 148 80 166 91"
            fill="none"
            stroke="#c8b77d"
            strokeWidth="3"
          />
          <path d="m120 89-5 8 6 7 5-9Z" fill="#acbe92" />
        </>
      ) : null}
      {mage || healer ? (
        <>
          <path
            d="M69 126Q60 72 91 55Q137 28 164 77L172 131 153 107 144 73 117 90 91 91 80 132Z"
            fill={mage ? "#cfbeb0" : "#d1bd8b"}
          />
          <path d="M81 88Q105 52 143 64L122 76Z" fill="#e3d3b8" />
          <path
            d="m91 87 27 8 29-12"
            fill="none"
            stroke="#baa774"
            strokeWidth="3"
          />
          <path d="m119 89 6 9-6 10-6-9Z" fill={mage ? "#b0a1c8" : "#93b7a4"} />
          <path
            d="m83 133 5 37-14 25m81-60 8 48 12 24"
            stroke={mage ? "#cebbb0" : "#cfba84"}
            strokeWidth="13"
            fill="none"
          />
        </>
      ) : null}
      {rogue ? (
        <>
          <path
            d="M67 119Q51 63 98 47Q146 21 173 84L170 132 151 82 128 71 95 87 81 124"
            fill="#414a58"
          />
          <path
            d="m60 130 45 12 46-6 23-13-16 50-37 17-39-22Z"
            fill="#454d55"
          />
          <path
            d="m75 147 43 16 35-13"
            stroke="#70717a"
            strokeWidth="2"
            fill="none"
          />
        </>
      ) : null}
      <path
        d="M32 280 45 221Q52 195 91 184L120 211 150 184Q191 196 200 221L219 280"
        fill={`url(#${u}armor)`}
      />
      <path
        d="m88 185 31 27-13 19-32-37m76-10-31 28 13 19 33-39"
        fill={knight ? "#aaab91" : "#8b997e"}
        opacity=".65"
      />
      <path
        d="m49 215 33 4-14 37-33-4m158-37-32 4 15 37 33-4"
        fill={knight ? "#9ca08d" : h.color}
        stroke="#c3b98c"
        strokeOpacity=".45"
        strokeWidth="2"
      />
      <path d="m85 228 32 18 35-19-4 53H88Z" fill="#294039" opacity=".65" />
      <path
        d="m117 214 0 66m-21-43 23 17 22-15"
        stroke="#c0ac78"
        opacity=".55"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="119" cy="221" r="8" fill="#b8a576" />
      <path d="m119 216 4 5-4 6-4-6Z" fill={h.color} />
      {mage || healer ? (
        <>
          <path d="M182 280 192 157" stroke="#a89870" strokeWidth="6" />
          <path
            d="m190 170-14-22 17-19 14 21Z"
            fill="none"
            stroke="#c5b583"
            strokeWidth="4"
          />
          <circle cx="192" cy="149" r="9" fill={mage ? "#bbb0db" : "#bbd9b7"} />
          <circle cx="192" cy="149" r="18" fill={h.color} opacity=".23" />
        </>
      ) : null}
      {elf ? (
        <>
          <path
            d="M41 277Q8 210 51 160"
            stroke="#b3a074"
            strokeWidth="5"
            fill="none"
          />
          <path d="m51 160-10 117" stroke="#bbb995" strokeWidth="1" />
        </>
      ) : null}
      <path
        d="M0 277H240"
        stroke="#d4c093"
        strokeOpacity=".2"
        strokeWidth="6"
      />
    </svg>
  );
}
export function MissionArt({ scene = "forest", className = "" }) {
  const u = useId().replaceAll(":", "");
  const warm = scene === "volcano",
    ruins = scene === "ruins",
    mountain = scene === "mountain";
  return (
    <svg
      className={className}
      viewBox="0 0 600 240"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${scene} expedition landscape`}
    >
      <defs>
        <linearGradient id={`${u}s`} x2="0" y2="1">
          <stop
            stopColor={
              warm
                ? "#755951"
                : ruins
                  ? "#536577"
                  : mountain
                    ? "#748888"
                    : "#758b75"
            }
          />
          <stop offset="1" stopColor={warm ? "#b18b65" : "#adb391"} />
        </linearGradient>
        <linearGradient id={`${u}f`} x2="0" y2="1">
          <stop stopColor="#162822" stopOpacity="0" />
          <stop offset="1" stopColor="#162822" stopOpacity=".7" />
        </linearGradient>
      </defs>
      <rect width="600" height="240" fill={`url(#${u}s)`} />
      <circle
        cx="424"
        cy="54"
        r="26"
        fill={warm ? "#dab083" : "#d5d0ae"}
        opacity=".5"
      />
      <path
        d="M0 165 95 63 168 124 279 33 390 145 506 54 600 131V240H0"
        fill={warm ? "#7c6660" : "#657e73"}
      />
      <path
        d="m231 89 48-56 58 67-49-28-12-16-14 23Z"
        fill="#c1c5aa"
        opacity=".45"
      />
      <path
        d="M0 178Q68 105 164 175L225 125 337 192 468 132 600 177V240H0"
        fill={warm ? "#5f554d" : "#496958"}
      />
      {warm ? (
        <>
          <path d="m213 181 62-112 70 110" fill="#5f4f4b" />
          <path
            d="m269 78 7-9 8 14 10 50-15-28-4 48-9 28 1-58"
            fill="#d29b62"
          />
          <path
            d="m275 69-20-47m23 40 10-37m-10 28 21-41"
            stroke="#a49278"
            strokeWidth="14"
            opacity=".2"
          />
        </>
      ) : null}
      {ruins ? (
        <g fill="#8f9b8a">
          <path d="M255 194V82L265 70H279V194ZM336 197V91L345 78H358V197Z" />
          <path d="M262 99V79Q309 43 351 87L346 101Q310 67 276 110Z" />
          <path d="m235 205 10-19 32 1 7 18m39 0 10-15 37 10-9 11" />
        </g>
      ) : null}
      {scene === "village" ? (
        <>
          <Hut x={281} y={172} s={0.8} />
          <Hut x={367} y={181} s={0.65} />
          <Tower x={314} y={168} s={0.6} />
        </>
      ) : null}
      {!warm &&
        [
          [55, 204, 1.7],
          [139, 200, 1.1],
          [190, 173, 0.7],
          [479, 187, 1.1],
          [539, 216, 1.8],
          [402, 179, 0.6],
        ].map(([x, y, s], i) => (
          <Tree
            key={i}
            x={x}
            y={y}
            s={s}
            pine={mountain || i % 2 === 0}
            c={i % 2 ? "#395d43" : "#2b503f"}
          />
        ))}
      <path
        d="M296 168Q278 191 319 240H273Q263 191 290 168"
        fill="#a3a082"
        opacity=".6"
      />
      <path
        d="M0 223Q151 187 224 240M381 240Q518 193 600 211V240Z"
        fill="#254a37"
      />
      <rect width="600" height="240" fill={`url(#${u}f)`} />
    </svg>
  );
}
export function SummonArt() {
  return (
    <svg
      viewBox="0 0 500 420"
      role="img"
      aria-label="A luminous aether gateway surrounded by ancient stones"
    >
      <defs>
        <radialGradient id="portalGlow">
          <stop stopColor="#aabcc5" stopOpacity=".5" />
          <stop offset=".5" stopColor="#749399" stopOpacity=".2" />
          <stop offset="1" stopColor="#749399" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="portalStone">
          <stop stopColor="#acb29a" />
          <stop offset="1" stopColor="#455c53" />
        </linearGradient>
      </defs>
      <circle cx="250" cy="191" r="184" fill="url(#portalGlow)" />
      <ellipse cx="250" cy="347" rx="137" ry="27" fill="#142821" />
      <ellipse cx="250" cy="329" rx="108" ry="21" fill="#738274" />
      <ellipse cx="250" cy="324" rx="95" ry="17" fill="#93a692" opacity=".5" />
      <path
        d="M157 323V169Q157 72 250 72T343 169V323H316V172Q316 104 250 104T184 172V323Z"
        fill="url(#portalStone)"
      />
      <path
        d="M180 313V170Q180 101 250 101T320 170V313"
        fill="none"
        stroke="#c0c9ac"
        strokeWidth="3"
      />
      <path
        d="M193 308V174Q193 119 250 119T307 174V308"
        fill="url(#portalGlow)"
        stroke="#86b7b1"
        strokeWidth="2"
      />
      <path
        d="M161 237h22m-24-59 25 2m-15-56 26 12m10-46 15 26m31-44v31m46-18-14 25m49 15-23 12m31 40-24 3m26 53h-23"
        stroke="#354f46"
        strokeWidth="3"
      />
      <path d="m250 170 28 45-28 41-28-41Z" fill="#aac7c9" />
      <path d="m250 170 0 86-28-41Z" fill="#7b9ba9" />
      <path d="m250 184 18 30-18 26" fill="#d5e5d9" opacity=".7" />
      <ellipse
        cx="250"
        cy="220"
        rx="63"
        ry="17"
        fill="none"
        stroke="#9ec4b7"
        strokeDasharray="8 11"
        transform="rotate(-22 250 220)"
      />
      {[
        [210, 162],
        [296, 184],
        [269, 279],
        [217, 260],
        [266, 146],
        [134, 201],
        [354, 135],
        [364, 283],
        [123, 286],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`m${x} ${y - 4}v8m-4-4h8`}
          stroke="#d0d9b1"
          opacity={0.3 + i * 0.06}
        />
      ))}
      <Tree x={106} y={345} s={0.65} c="#365941" />
      <Tree x={385} y={341} s={0.8} c="#3b5b44" />
      <path
        d="m186 333 26 7m74-5 23-5m-73 19h27"
        stroke="#c0c9a0"
        strokeWidth="2"
        opacity=".5"
      />
    </svg>
  );
}
