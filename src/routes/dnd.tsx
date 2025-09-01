import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dnd')({
    component: RouteComponent,
});

function RouteComponent() {
    return <div>Hello "/dnd"!</div>;
}
