/* Sayımlar uygulama ve yayın paketinde aynı içerik listelerinden gelir. */
(function (W) {
'use strict';
const count = key => (W[key] || []).length;
const certificationBankQuestions = ['pl300', 'dp600'].reduce((total, exam) => total +
  (W['PBI_' + exam.toUpperCase()] || []).filter((_, i) => W.PBI_CERT_CLASS[exam + '#' + i]?.[0] !== 'duzelt').length, 0) +
  (W.PBI_CERTQ || []).filter(q => W.PBI_CERT_CLASS[q.id]?.[0] !== 'duzelt').length;
W.PBI_INVENTORY = Object.freeze({
  lessons: count('PBI_LESSONS'),
  lessonExercises: (W.PBI_LESSONS || []).reduce((total, lesson) => total + (lesson.ex || []).length, 0),
  practiceTasks: count('PBI_PRACTICE'),
  learningPaths: count('PBI_PATHS'),
  reports: count('PBI_DASHES'),
  reportPages: (W.PBI_DASHES || []).reduce((total, report) => total + W.PBI_DASHCORE.pagesOf(report).length, 0),
  caseDatasets: count('PBI_DATASETS'),
  placementQuestions: count('PBI_PLACEMENT'),
  certificationBankQuestions,
  interviewQuestions: count('PBI_IV_BANK'),
});
})(window);
