// AISpear — bir kullanıcı için EFEKTİF özellik erişimi.
// Öncelik: global bayrak (off/maintenance) > admin > rol izni > lisans özelliği.
import { FEATURES } from '@/lib/features';

export function effectiveFeatures({ isAdmin, rolePerms = {}, flags = {}, licenseFeatures = {} }) {
  const features = [];
  const maintenance = [];
  for (const f of FEATURES) {
    const flag = flags[f.key] || 'on';
    if (flag === 'maintenance') { maintenance.push(f.key); continue; }
    if (flag === 'off') continue;
    if (isAdmin) { features.push(f.key); continue; }
    if (rolePerms[f.key] === false) continue;
    if (licenseFeatures[f.key] === false) continue;
    features.push(f.key);
  }
  return { features, maintenance };
}
