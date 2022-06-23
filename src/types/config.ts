export interface Config {
	type: "text" | "textarea" | "select" | "range" | "checkbox";
	label: string;
	key: string;
	required: boolean;

	selectInputs?: {
		text: string;
		value: string;
	}[];

	rangeInput?: {
		min: number;
		max: number;
		step?: number;
	};

	checkboxInput?: {
		text: string;
		value: string;
	}[];
}
