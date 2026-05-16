import { useTheme } from "@mui/material/styles";
import {
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	Radar,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import type { CourseRatings } from "../api/types";
import { AXIS_COLORS } from "../api/mockData";

interface Props {
	ratings: CourseRatings;
}

const axisLabels: { key: keyof CourseRatings; label: string }[] = [
	{ key: "docencia", label: "Docencia" },
	{ key: "vibes", label: "Vibes" },
	{ key: "relevancia", label: "Relevancia" },
	{ key: "carga", label: "Carga" },
	{ key: "dificultad", label: "Dificultad" },
];

export default function CourseRadar({ ratings }: Props) {
	const theme = useTheme();
	const isDark = theme.palette.mode === "dark";

	const data = axisLabels.map((axis) => ({
		axis: axis.label,
		key: axis.key,
		value: ratings[axis.key],
		color: AXIS_COLORS[axis.key],
		fullMark: 5,
	}));

	const renderDot = (props: Record<string, unknown>) => {
		const { cx, cy, payload } = props as {
			cx: number;
			cy: number;
			payload: { key: string; color: string };
		};
		if (cx == null || cy == null) return <circle r={0} />;
		return (
			<circle
				key={`dot-${payload.key}`}
				cx={cx}
				cy={cy}
				r={5}
				fill={payload.color}
				stroke={theme.palette.background.paper}
				strokeWidth={2}
			/>
		);
	};

	return (
		<ResponsiveContainer width="100%" height={260}>
			<RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
				<PolarGrid
					stroke={isDark ? "rgba(230,225,216,0.1)" : "rgba(44,42,38,0.1)"}
				/>
				<PolarAngleAxis
					dataKey="axis"
					tick={({ x, y, payload: tickPayload }: any) => {
						const item = data.find((d) => d.axis === tickPayload.value);
						return (
							<text
								x={x}
								y={y}
								fill={item?.color ?? theme.palette.text.secondary}
								fontSize={12}
								fontFamily='"Figtree", sans-serif'
								fontWeight={600}
								textAnchor="middle"
								dominantBaseline="central"
							>
								{tickPayload.value}
							</text>
						);
					}}
				/>
				<PolarRadiusAxis
					angle={90}
					domain={[0, 5]}
					tick={false}
					axisLine={false}
				/>
				<Radar
					dataKey="value"
					stroke={theme.palette.primary.main}
					fill={theme.palette.primary.main}
					fillOpacity={isDark ? 0.25 : 0.15}
					strokeWidth={2}
					dot={renderDot}
				/>
				<Tooltip
					contentStyle={{
						backgroundColor: theme.palette.background.paper,
						border: `1px solid ${theme.palette.divider}`,
						borderRadius: 8,
						fontFamily: '"Figtree", sans-serif',
						fontSize: 13,
					}}
					formatter={(value) => [Number(value).toFixed(1), ""]}
				/>
			</RadarChart>
		</ResponsiveContainer>
	);
}
