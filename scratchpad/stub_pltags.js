/* geçici: yalnızca doğrulama için pl300 etiket taklidi */
const t = PBI_PL300.map(q => PBI_CERT_SKILLS.pl300.find(s => s.d === q.k).id);
window.PBI_CERT_TAGS = Object.assign(window.PBI_CERT_TAGS || {}, { pl300: t });
