import { Login } from '@components/login';
import { configured } from '@laviann/shared/server';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    return <Login connected={configured()} />;
}
