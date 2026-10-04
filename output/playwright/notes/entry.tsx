import React from 'react';
import styles from '../../../app/do/do-vision.module.css';
import { createRoot } from 'react-dom/client';
import { DoPhotoNotes } from '../../../app/do/DoPhotoNotes';
window.fetch = async () => Response.json({ text: 'Synthetic notes\nPrepare the room.\nCheck the flowers.\nThank everyone.', receipt: { model: 'synthetic-mock-no-provider', imageHash: 'fixture', outputHash: 'fixture', createdAt: new Date().toISOString(), boundary: 'Synthetic local browser proof only.' } });
createRoot(document.getElementById('root')!).render(<div className={styles.body} style={{fontFamily:'system-ui',padding:16}}><DoPhotoNotes /></div>);
