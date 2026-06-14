# iCn3D — MCD Miner Integration

Proof-of-concept integrating **iCn3D** 3D molecular visualization into the **MCD Miner** bioinformatics research pipeline.

Built during NSF-funded undergraduate research at the University of St. Thomas (ABRCMS 2023).

---

## What it does

Researchers working with motif-cluster data often jump between tabular outputs and external structure viewers. This project bridges that gap:

1. **Backend (Node.js / Express)** reads a motif-cluster row from `tempDataSet.csv`
2. Resolves motif patterns from `motifs.json` (including bracketed amino-acid variations)
3. Builds an **iCn3D command string** (UniProt ID + color/select commands for motif regions)
4. **Frontend** loads the [NCBI iCn3D](https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html) viewer in the browser and applies those commands on the 3D structure

Enter a row index (0–999) in the UI → see the matching protein structure with motif highlights.

---

## Project structure

```
iCn3D/
├── server.js           # Express API + CSV/motif → iCn3D command builder
├── motifs.json         # Motif pattern dictionary
├── tempDataSet.csv     # Sample MCD Miner output rows (tab-separated)
├── package.json
└── results/
    ├── index.html      # Input UI + fetch API
    └── iCn3D.html      # Embedded iCn3D viewer
```

---

## Run locally

```bash
cd iCn3D
npm install
npm start
```

Server runs at **http://localhost:5501**

Open **http://localhost:5501/index.html** — enter a dataset row ID (0–999) and submit.

> Requires internet access — iCn3D scripts load from NCBI CDN.

---

## API

| Method | Route | Body | Response |
|--------|-------|------|----------|
| `POST` | `/` | `{ "parcel": "77" }` | `{ "info": "<uniprot>, <icn3d commands...>" }` |
| `GET` | `/info` | — | Latest generated command |

---

## Tech stack

Node.js · Express · JavaScript · iCn3D (NCBI) · MCD Miner motif data

---

## Status

Research proof-of-concept. Original pipeline repos were lab-owned; this is my recovered implementation from local backups.

---

## Author

**Jarvin Chavez** · [GitHub](https://github.com/JarvinChavez) · [LinkedIn](https://www.linkedin.com/in/jarvin-chavez-b9ba9a266/)
