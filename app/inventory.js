/* Sayımlar uygulama ve yayın paketinde aynı içerik listelerinden gelir. */
(function (W) {
'use strict';
const count = key => (W[key] || []).length;
const certificationBankQuestions = () => ['pl300', 'dp600'].reduce((total, exam) => total +
  (W['PBI_' + exam.toUpperCase()] || []).filter((_, i) => W.PBI_CERT_CLASS[exam + '#' + i]?.[0] !== 'duzelt').length, 0) +
  (W.PBI_CERTQ || []).filter(q => W.PBI_CERT_CLASS[q.id]?.[0] !== 'duzelt').length;
/* Getter: yayın paketinde mülakat ve sık hatalar açılıştan sonra yüklenir (kesit-ek.js); sayılar her okunduğunda güncel. */
W.PBI_INVENTORY = Object.freeze({
  get lessons() { return count('PBI_LESSONS'); },
  get lessonExercises() { return (W.PBI_LESSONS || []).reduce((total, lesson) => total + (lesson.ex || []).length, 0); },
  get practiceTasks() { return count('PBI_PRACTICE'); },
  get learningPaths() { return count('PBI_PATHS'); },
  get reports() { return count('PBI_DASHES'); },
  get reportPages() { return (W.PBI_DASHES || []).reduce((total, report) => total + W.PBI_DASHCORE.pagesOf(report).length, 0); },
  get caseDatasets() { return count('PBI_DATASETS'); },
  get placementQuestions() { return count('PBI_PLACEMENT'); },
  get certificationBankQuestions() { return certificationBankQuestions(); },
  get interviewQuestions() { return count('PBI_IV_BANK'); },
});
})(window);
