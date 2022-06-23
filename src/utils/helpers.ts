export const respond = (response: any) =>
	new Response(JSON.stringify(response), {
		headers: { "content-type": "application/json" },
	});
