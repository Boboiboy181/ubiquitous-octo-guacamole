import { createFileRoute } from '@tanstack/react-router';
import { Crop } from '~/components/pages/cropper/components';

export const Route = createFileRoute('/cropper')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div>
            <Crop />
        </div>
    );
}
