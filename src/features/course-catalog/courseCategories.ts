import type { CourseCategory } from "../../shared/types/domain";
export const COURSE_CATEGORIES = [
	{ value: "dcc", label: "DCC" },
	{ value: "required", label: "Obligatorios" },
	{ value: "specialization", label: "Electivos Especialidad" },
	{ value: "bachelor", label: "Electivos Licenciatura" },
	{ value: "management", label: "Núcleo Gestión" },
	{ value: "integral", label: "Formación Integral" },
] as const;

const codes = (value: string) => new Set(value.trim().split(/\s+/));

export const COURSE_CATEGORY_CODES: Partial<
	Record<CourseCategory, Set<string>>
> = {
	integral: codes(`CC5609 CC5611 CC5613 CC5614 CC5622 CC5623 CFIE006`),
	management: codes(`CC5601 CC5602 CC5603 CC5621 IN3858`),
	required:
		codes(`CC1000 CC1002 CC4900 CC4902 CC5900 CC6930 CC6910 CC6919 CC3201 CC4901 CC3001 CC4401 CC3501
CC3101 CC5205 CC4402 CC4102 CC3102 CC4303 CC3002 CC3301 MA3403 CC4101
CC4302 EI1090 CC5901 CC5402 EI2090 CC6907`),
	specialization: codes(`CC4310 CC5002 CC5003 CC5101 CC5113 CC5114 CC5115 CC5116
CC5117 CC5118 CC5119 CC5201 CC5206 CC5208 CC5209 CC5212 CC5213 CC5214 CC5215
CC5216 CC5217 CC5218 CC5219 CC5220 CC5221 CC5301 CC5303 CC5304 CC5308 CC5312
CC5317 CC5322 CC5325 CC5326 CC5327 CC5328 CC5330 CC5401 CC5404 CC5408 CC5409
CC5501 CC5502 CC5504 CC5508 CC5509 CC5510 CC5511 CC5512 CC5513 CC5514 CC5516
CC5601 CC5602 CC5603 CC5604 CC5615 CC5617 CC5618 CC5619 CC5620 CC5621 CC5701
CC5703 CC5905 CC6104 CC6204 CC6205 CC6301 CC6401 CC6402 CC6409 CC6501 CC6502
CC6603 CC7110 CC7125 CC7126 CC7220 CC7221 CC7320 CC7325 CC7513 CC7515 CC7910
CEE010 CEE015 CEE016 CEE020 CEE030 CEE040 CEE047 CEE050 CEE060 EL4106 EL5206
EL7006 EL7007 EL7008 EL7031 EL7037 IN3858 MA5309 MA5505 MA6202 MDS7101
MDS7201 MDS7202 MDS7203 MDS7205`),
};

export function matchesCourseCategory(
	code: string,
	category: CourseCategory,
): boolean {
	if (category === "dcc") {
		return COURSE_CATEGORIES.some(
			(option) =>
				option.value !== "dcc" && matchesCourseCategory(code, option.value),
		);
	}
	if (category === "bachelor") {
		return (
			/^CC\d{4}$/.test(code) &&
			code !== "CC3003" &&
			Number(code.slice(2)) >= 3000 &&
			Number(code.slice(2)) <= 7911 &&
			!(["required", "management", "integral"] as const).some((excluded) =>
				COURSE_CATEGORY_CODES[excluded]?.has(code),
			)
		);
	}
	return COURSE_CATEGORY_CODES[category]?.has(code) ?? false;
}
