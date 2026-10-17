import { configured } from '@laviann/shared/server';
import { Login } from '../../components/login';
export const dynamic = 'force-dynamic';
export default function LoginPage() {
    return <Login connected={configured()} />;
}
