'use client';
import * as React from 'react';
import { Button } from '@/shared/components/ui/button';
import { applyBackup, createBackup, type BackupFile } from '@/shared/lib/backup';

const Backup: React.FC = () => {
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const onExport = () => {
    const data = createBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kanadojo-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Exported to kanadojo-backup.json');
  };

  const onFilePicked = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as BackupFile;
      const ok = applyBackup(parsed);
      setMessage(ok ? 'Imported backup successfully' : 'Import failed');
    } catch {
      setMessage('Invalid file');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-3">
        <Button onClick={onExport} className="hover:cursor-pointer">Export</Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()} className="hover:cursor-pointer">
          Import
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const f = e.target.files?.[0];
            if (f) onFilePicked(f);
          }}
        />
      </div>
      {message && (
        <p className="text-sm text-[var(--secondary-color)]">{message}</p>
      )}
      <p className="text-xs opacity-70">
        Exports only preferences and stats. No account data is included.
      </p>
    </div>
  );
};

export default Backup;
