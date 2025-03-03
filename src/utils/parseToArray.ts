export default function parseToArray(data: string | null) {
    try {
        if (data === "") {
            return [];
        } else {
            return data?.split(",") ?? [];
        }
    } catch (error) {
        return [];
    }
}