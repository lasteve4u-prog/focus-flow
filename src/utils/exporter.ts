import type { DailyLog } from '../types';

export const exportToMarkdown = (dailyLog: DailyLog) => {
    const { date, events, tasks } = dailyLog;

    const lines: string[] = [];
    lines.push(`# ${date}`);
    lines.push('');

    lines.push('## To Do');
    if (events.length === 0) {
        lines.push('- No to-dos recorded.');
    } else {
        events.forEach(evt => {
            lines.push(`- [ ] ${evt.title} (集中 ${evt.focusDuration}分 / 休憩 ${evt.breakDuration}分)`);
        });
    }
    lines.push('');

    lines.push('## Tasks');
    if (tasks.length === 0) {
        lines.push('- No tasks recorded.');
    } else {
        // Sort tasks by start time (using startedAt ISO string)
        const sortedTasks = [...tasks].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
        sortedTasks.forEach(task => {
            // Calculate duration or use recorded duration
            const duration = task.durationMinutes ? `(${task.durationMinutes}m)` : '';
            // Format start time from ISO
            const startTime = new Date(task.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            lines.push(`- [x] ${startTime} ${task.title} ${duration}`);

            // Add completion details if available
            if (task.toiletDoneAt || task.paperDoneAt || task.description) {
                if (task.description) {
                    // Indent description properly
                    const descLines = task.description.split('\n');
                    descLines.forEach(l => lines.push(`    > ${l}`));
                }
                if (task.toiletDoneAt || task.paperDoneAt) {
                    lines.push(`    - Refreshed/Logged at: ${new Date(task.paperDoneAt || new Date().toISOString()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
                }
            }
        });
    }

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${date}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
