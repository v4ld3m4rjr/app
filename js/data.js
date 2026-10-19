/* ===================================================================
   data.js — Data Layer & Scientific Calculations Engine
   Full mathematical model from monitor meu.xlsx:
   - Eric Banister TRIMP (1991)
   - Andrew Coggan TSS, ATL, CTL, TSB (PMC Model)
   - Carl Foster PSE (Borg CR-10), Monotonia & Strain (1998)
   - Kellmann & Kallus PSR (2001)
   - SheetJS Excel (.xlsx) & CSV Import / Export
   =================================================================== */

const INITIAL_SPREADSHEET_SEED = [
  {
    "date": "2026-09-17",
    "weekday": "qui",
    "sonoQ": 7,
    "sensacao": 6,
    "sonoWatch": 72,
    "sonoH": 6.8,
    "valorSono": 6.5,
    "recupSonoPct": 7.2,
    "hrv": 68,
    "rhr": 48,
    "psr": 7,
    "estresse": 4,
    "dorManha": 4,
    "dorMeio": 3,
    "dorNoite": 3,
    "dor": 4,
    "dorLocal": "Lombar",
    "wkType": "Musculação / Força",
    "dur": 85,
    "pse": 8,
    "fcmedia": 148,
    "trimp": 680,
    "tss": 435.2,
    "notes": "Sessão planejada de Musculação / Força",
    "atl": 92.6,
    "ctl": 54.2,
    "tsb": -38.4,
    "monotonia": 435.2,
    "strain": 189399.0,
    "prontidao": 18,
    "recuperacao": 53
  },
  {
    "date": "2026-09-18",
    "weekday": "sex",
    "sonoQ": 8,
    "sensacao": 7,
    "sonoWatch": 80,
    "sonoH": 7.5,
    "valorSono": 7.5,
    "recupSonoPct": 8.0,
    "hrv": 74,
    "rhr": 48,
    "psr": 7,
    "estresse": 3,
    "dorManha": 2,
    "dorMeio": 2,
    "dorNoite": 1,
    "dor": 2,
    "dorLocal": "Ombros",
    "wkType": "Musculação / Membros Sup.",
    "dur": 75,
    "pse": 6,
    "fcmedia": 138,
    "trimp": 450,
    "tss": 288.0,
    "notes": "Sessão planejada de Musculação / Membros Sup.",
    "atl": 118.6,
    "ctl": 59.7,
    "tsb": -58.9,
    "monotonia": 4.91,
    "strain": 3550.9,
    "prontidao": 47,
    "recuperacao": 61
  },
  {
    "date": "2026-09-19",
    "weekday": "sab",
    "sonoQ": 9,
    "sensacao": 9,
    "sonoWatch": 89,
    "sonoH": 8.5,
    "valorSono": 9.0,
    "recupSonoPct": 8.9,
    "hrv": 84,
    "rhr": 46,
    "psr": 8,
    "estresse": 2,
    "dorManha": 1,
    "dorMeio": 1,
    "dorNoite": 0,
    "dor": 1,
    "dorLocal": "Nenhuma dor",
    "wkType": "Mobilidade / Regenerativo",
    "dur": 35,
    "pse": 2,
    "fcmedia": 110,
    "trimp": 70,
    "tss": 44.8,
    "notes": "Sessão planejada de Mobilidade / Regenerativo",
    "atl": 108.8,
    "ctl": 59.3,
    "tsb": -49.5,
    "monotonia": 1.59,
    "strain": 1221.1,
    "prontidao": 80,
    "recuperacao": 74
  },
  {
    "date": "2026-09-20",
    "weekday": "dom",
    "sonoQ": 9,
    "sensacao": 9,
    "sonoWatch": 92,
    "sonoH": 9.0,
    "valorSono": 9.0,
    "recupSonoPct": 9.2,
    "hrv": 88,
    "rhr": 46,
    "psr": 9,
    "estresse": 1,
    "dorManha": 0,
    "dorMeio": 0,
    "dorNoite": 0,
    "dor": 0,
    "dorLocal": "Nenhuma dor",
    "wkType": "Repouso Total",
    "dur": 0,
    "pse": 0,
    "fcmedia": 50,
    "trimp": 0,
    "tss": 0.0,
    "notes": "Recuperação e restauração metabólica",
    "atl": 94.3,
    "ctl": 57.9,
    "tsb": -36.4,
    "monotonia": 1.08,
    "strain": 829.4,
    "prontidao": 93,
    "recuperacao": 81
  },
  {
    "date": "2026-09-21",
    "weekday": "seg",
    "sonoQ": 8,
    "sensacao": 7,
    "sonoWatch": 84,
    "sonoH": 7.5,
    "valorSono": 7.5,
    "recupSonoPct": 8.4,
    "hrv": 78,
    "rhr": 48,
    "psr": 8,
    "estresse": 3,
    "dorManha": 2,
    "dorMeio": 2,
    "dorNoite": 1,
    "dor": 2,
    "dorLocal": "Posterior de Coxa",
    "wkType": "Musculação / Força",
    "dur": 80,
    "pse": 6,
    "fcmedia": 142,
    "trimp": 480,
    "tss": 307.2,
    "notes": "Sessão planejada de Musculação / Força",
    "atl": 122.7,
    "ctl": 63.8,
    "tsb": -58.9,
    "monotonia": 1.3,
    "strain": 1397.8,
    "prontidao": 49,
    "recuperacao": 66
  },
  {
    "date": "2026-09-22",
    "weekday": "ter",
    "sonoQ": 7,
    "sensacao": 7,
    "sonoWatch": 78,
    "sonoH": 7.0,
    "valorSono": 7.0,
    "recupSonoPct": 7.8,
    "hrv": 72,
    "rhr": 48,
    "psr": 7,
    "estresse": 4,
    "dorManha": 3,
    "dorMeio": 2,
    "dorNoite": 3,
    "dor": 3,
    "dorLocal": "Peitoral / Ombros",
    "wkType": "Musculação / Força",
    "dur": 95,
    "pse": 7,
    "fcmedia": 150,
    "trimp": 665,
    "tss": 425.6,
    "notes": "Sessão planejada de Musculação / Força",
    "atl": 163.0,
    "ctl": 72.3,
    "tsb": -90.7,
    "monotonia": 1.47,
    "strain": 2206.2,
    "prontidao": 28,
    "recuperacao": 57
  },
  {
    "date": "2026-09-23",
    "weekday": "qua",
    "sonoQ": 8,
    "sensacao": 8,
    "sonoWatch": 85,
    "sonoH": 8.0,
    "valorSono": 8.0,
    "recupSonoPct": 8.5,
    "hrv": 76,
    "rhr": 48,
    "psr": 7,
    "estresse": 3,
    "dorManha": 2,
    "dorMeio": 1,
    "dorNoite": 2,
    "dor": 2,
    "dorLocal": "Panturrilhas",
    "wkType": "Corrida / Intervalado",
    "dur": 60,
    "pse": 7,
    "fcmedia": 158,
    "trimp": 420,
    "tss": 268.8,
    "notes": "Sessão planejada de Corrida / Intervalado",
    "atl": 177.1,
    "ctl": 76.9,
    "tsb": -100.1,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 48,
    "recuperacao": 63
  },
  {
    "date": "2026-09-24",
    "weekday": "qui",
    "sonoQ": 7,
    "sensacao": 6,
    "sonoWatch": 72,
    "sonoH": 6.8,
    "valorSono": 6.5,
    "recupSonoPct": 7.2,
    "hrv": 68,
    "rhr": 48,
    "psr": 7,
    "estresse": 4,
    "dorManha": 4,
    "dorMeio": 3,
    "dorNoite": 3,
    "dor": 4,
    "dorLocal": "Lombar",
    "wkType": "Musculação / Força",
    "dur": 85,
    "pse": 8,
    "fcmedia": 148,
    "trimp": 680,
    "tss": 435.2,
    "notes": "Sessão planejada de Musculação / Força",
    "atl": 211.4,
    "ctl": 85.4,
    "tsb": -126.1,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 18,
    "recuperacao": 53
  },
  {
    "date": "2026-09-25",
    "weekday": "sex",
    "sonoQ": 8,
    "sensacao": 7,
    "sonoWatch": 80,
    "sonoH": 7.5,
    "valorSono": 7.5,
    "recupSonoPct": 8.0,
    "hrv": 74,
    "rhr": 48,
    "psr": 7,
    "estresse": 3,
    "dorManha": 2,
    "dorMeio": 2,
    "dorNoite": 1,
    "dor": 2,
    "dorLocal": "Ombros",
    "wkType": "Musculação / Membros Sup.",
    "dur": 75,
    "pse": 6,
    "fcmedia": 138,
    "trimp": 450,
    "tss": 288.0,
    "notes": "Sessão planejada de Musculação / Membros Sup.",
    "atl": 221.6,
    "ctl": 90.1,
    "tsb": -131.5,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 47,
    "recuperacao": 61
  },
  {
    "date": "2026-09-26",
    "weekday": "sab",
    "sonoQ": 9,
    "sensacao": 9,
    "sonoWatch": 89,
    "sonoH": 8.5,
    "valorSono": 9.0,
    "recupSonoPct": 8.9,
    "hrv": 84,
    "rhr": 46,
    "psr": 8,
    "estresse": 2,
    "dorManha": 1,
    "dorMeio": 1,
    "dorNoite": 0,
    "dor": 1,
    "dorLocal": "Nenhuma dor",
    "wkType": "Mobilidade / Regenerativo",
    "dur": 35,
    "pse": 2,
    "fcmedia": 110,
    "trimp": 70,
    "tss": 44.8,
    "notes": "Sessão planejada de Mobilidade / Regenerativo",
    "atl": 198.1,
    "ctl": 89.1,
    "tsb": -109.0,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 80,
    "recuperacao": 74
  },
  {
    "date": "2026-09-27",
    "weekday": "dom",
    "sonoQ": 9,
    "sensacao": 9,
    "sonoWatch": 92,
    "sonoH": 9.0,
    "valorSono": 9.0,
    "recupSonoPct": 9.2,
    "hrv": 88,
    "rhr": 46,
    "psr": 9,
    "estresse": 1,
    "dorManha": 0,
    "dorMeio": 0,
    "dorNoite": 0,
    "dor": 0,
    "dorLocal": "Nenhuma dor",
    "wkType": "Repouso Total",
    "dur": 0,
    "pse": 0,
    "fcmedia": 50,
    "trimp": 0,
    "tss": 0.0,
    "notes": "Recuperação e restauração metabólica",
    "atl": 171.7,
    "ctl": 87.0,
    "tsb": -84.7,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 93,
    "recuperacao": 81
  },
  {
    "date": "2026-09-28",
    "weekday": "seg",
    "sonoQ": 8,
    "sensacao": 7,
    "sonoWatch": 84,
    "sonoH": 7.5,
    "valorSono": 7.5,
    "recupSonoPct": 8.4,
    "hrv": 78,
    "rhr": 48,
    "psr": 8,
    "estresse": 3,
    "dorManha": 2,
    "dorMeio": 2,
    "dorNoite": 1,
    "dor": 2,
    "dorLocal": "Posterior de Coxa",
    "wkType": "Musculação / Força",
    "dur": 80,
    "pse": 6,
    "fcmedia": 142,
    "trimp": 480,
    "tss": 307.2,
    "notes": "Sessão planejada de Musculação / Força",
    "atl": 189.8,
    "ctl": 92.2,
    "tsb": -97.6,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 49,
    "recuperacao": 66
  },
  {
    "date": "2026-09-29",
    "weekday": "ter",
    "sonoQ": 7,
    "sensacao": 7,
    "sonoWatch": 78,
    "sonoH": 7.0,
    "valorSono": 7.0,
    "recupSonoPct": 7.8,
    "hrv": 72,
    "rhr": 48,
    "psr": 7,
    "estresse": 4,
    "dorManha": 3,
    "dorMeio": 2,
    "dorNoite": 3,
    "dor": 3,
    "dorLocal": "Peitoral / Ombros",
    "wkType": "Musculação / Força",
    "dur": 95,
    "pse": 7,
    "fcmedia": 150,
    "trimp": 665,
    "tss": 425.6,
    "notes": "Sessão planejada de Musculação / Força",
    "atl": 221.1,
    "ctl": 100.0,
    "tsb": -121.1,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 28,
    "recuperacao": 57
  },
  {
    "date": "2026-09-30",
    "weekday": "qua",
    "sonoQ": 8,
    "sensacao": 8,
    "sonoWatch": 85,
    "sonoH": 8.0,
    "valorSono": 8.0,
    "recupSonoPct": 8.5,
    "hrv": 76,
    "rhr": 48,
    "psr": 7,
    "estresse": 3,
    "dorManha": 2,
    "dorMeio": 1,
    "dorNoite": 2,
    "dor": 2,
    "dorLocal": "Panturrilhas",
    "wkType": "Corrida / Intervalado",
    "dur": 60,
    "pse": 7,
    "fcmedia": 158,
    "trimp": 420,
    "tss": 268.8,
    "notes": "Sessão planejada de Corrida / Intervalado",
    "atl": 227.5,
    "ctl": 104.0,
    "tsb": -123.5,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 48,
    "recuperacao": 63
  },
  {
    "date": "2026-10-01",
    "weekday": "qui",
    "sonoQ": 7,
    "sensacao": 6,
    "sonoWatch": 72,
    "sonoH": 6.8,
    "valorSono": 6.5,
    "recupSonoPct": 7.2,
    "hrv": 68,
    "rhr": 48,
    "psr": 7,
    "estresse": 4,
    "dorManha": 4,
    "dorMeio": 3,
    "dorNoite": 3,
    "dor": 4,
    "dorLocal": "Lombar",
    "wkType": "Musculação / Força",
    "dur": 85,
    "pse": 8,
    "fcmedia": 148,
    "trimp": 680,
    "tss": 435.2,
    "notes": "Sessão planejada de Musculação / Força",
    "atl": 255.1,
    "ctl": 111.8,
    "tsb": -143.4,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 18,
    "recuperacao": 53
  },
  {
    "date": "2026-10-02",
    "weekday": "sex",
    "sonoQ": 8,
    "sensacao": 7,
    "sonoWatch": 80,
    "sonoH": 7.5,
    "valorSono": 7.5,
    "recupSonoPct": 8.0,
    "hrv": 74,
    "rhr": 48,
    "psr": 7,
    "estresse": 3,
    "dorManha": 2,
    "dorMeio": 2,
    "dorNoite": 1,
    "dor": 2,
    "dorLocal": "Ombros",
    "wkType": "Musculação / Membros Sup.",
    "dur": 75,
    "pse": 6,
    "fcmedia": 138,
    "trimp": 450,
    "tss": 288.0,
    "notes": "Sessão planejada de Musculação / Membros Sup.",
    "atl": 259.5,
    "ctl": 115.9,
    "tsb": -143.6,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 47,
    "recuperacao": 61
  },
  {
    "date": "2026-10-03",
    "weekday": "sab",
    "sonoQ": 9,
    "sensacao": 9,
    "sonoWatch": 89,
    "sonoH": 8.5,
    "valorSono": 9.0,
    "recupSonoPct": 8.9,
    "hrv": 84,
    "rhr": 46,
    "psr": 8,
    "estresse": 2,
    "dorManha": 1,
    "dorMeio": 1,
    "dorNoite": 0,
    "dor": 1,
    "dorLocal": "Nenhuma dor",
    "wkType": "Mobilidade / Regenerativo",
    "dur": 35,
    "pse": 2,
    "fcmedia": 110,
    "trimp": 70,
    "tss": 44.8,
    "notes": "Sessão planejada de Mobilidade / Regenerativo",
    "atl": 230.9,
    "ctl": 114.2,
    "tsb": -116.7,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 80,
    "recuperacao": 74
  },
  {
    "date": "2026-10-04",
    "weekday": "dom",
    "sonoQ": 9,
    "sensacao": 9,
    "sonoWatch": 92,
    "sonoH": 9.0,
    "valorSono": 9.0,
    "recupSonoPct": 9.2,
    "hrv": 88,
    "rhr": 46,
    "psr": 9,
    "estresse": 1,
    "dorManha": 0,
    "dorMeio": 0,
    "dorNoite": 0,
    "dor": 0,
    "dorLocal": "Nenhuma dor",
    "wkType": "Repouso Total",
    "dur": 0,
    "pse": 0,
    "fcmedia": 50,
    "trimp": 0,
    "tss": 0.0,
    "notes": "Recuperação e restauração metabólica",
    "atl": 200.2,
    "ctl": 111.5,
    "tsb": -88.6,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 93,
    "recuperacao": 81
  },
  {
    "date": "2026-10-05",
    "weekday": "seg",
    "sonoQ": 8,
    "sensacao": 7,
    "sonoWatch": 84,
    "sonoH": 7.5,
    "valorSono": 7.5,
    "recupSonoPct": 8.4,
    "hrv": 78,
    "rhr": 48,
    "psr": 8,
    "estresse": 3,
    "dorManha": 2,
    "dorMeio": 2,
    "dorNoite": 1,
    "dor": 2,
    "dorLocal": "Posterior de Coxa",
    "wkType": "Musculação / Força",
    "dur": 80,
    "pse": 6,
    "fcmedia": 142,
    "trimp": 480,
    "tss": 307.2,
    "notes": "Sessão planejada de Musculação / Força",
    "atl": 214.4,
    "ctl": 116.2,
    "tsb": -98.3,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 49,
    "recuperacao": 66
  },
  {
    "date": "2026-10-06",
    "weekday": "ter",
    "sonoQ": 7,
    "sensacao": 7,
    "sonoWatch": 78,
    "sonoH": 7.0,
    "valorSono": 7.0,
    "recupSonoPct": 7.8,
    "hrv": 72,
    "rhr": 48,
    "psr": 7,
    "estresse": 4,
    "dorManha": 3,
    "dorMeio": 2,
    "dorNoite": 3,
    "dor": 3,
    "dorLocal": "Peitoral / Ombros",
    "wkType": "Musculação / Força",
    "dur": 95,
    "pse": 7,
    "fcmedia": 150,
    "trimp": 665,
    "tss": 425.6,
    "notes": "Sessão planejada de Musculação / Força",
    "atl": 242.5,
    "ctl": 123.4,
    "tsb": -119.1,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 28,
    "recuperacao": 57
  },
  {
    "date": "2026-10-07",
    "weekday": "qua",
    "sonoQ": 8,
    "sensacao": 8,
    "sonoWatch": 85,
    "sonoH": 8.0,
    "valorSono": 8.0,
    "recupSonoPct": 8.5,
    "hrv": 76,
    "rhr": 48,
    "psr": 7,
    "estresse": 3,
    "dorManha": 2,
    "dorMeio": 1,
    "dorNoite": 2,
    "dor": 2,
    "dorLocal": "Panturrilhas",
    "wkType": "Corrida / Intervalado",
    "dur": 60,
    "pse": 7,
    "fcmedia": 158,
    "trimp": 420,
    "tss": 268.8,
    "notes": "Sessão planejada de Corrida / Intervalado",
    "atl": 246.0,
    "ctl": 126.9,
    "tsb": -119.2,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 48,
    "recuperacao": 63
  },
  {
    "date": "2026-10-08",
    "weekday": "qui",
    "sonoQ": 7,
    "sensacao": 6,
    "sonoWatch": 72,
    "sonoH": 6.8,
    "valorSono": 6.5,
    "recupSonoPct": 7.2,
    "hrv": 68,
    "rhr": 48,
    "psr": 7,
    "estresse": 4,
    "dorManha": 4,
    "dorMeio": 3,
    "dorNoite": 3,
    "dor": 4,
    "dorLocal": "Lombar",
    "wkType": "Musculação / Força",
    "dur": 85,
    "pse": 8,
    "fcmedia": 148,
    "trimp": 680,
    "tss": 435.2,
    "notes": "Sessão planejada de Musculação / Força",
    "atl": 271.2,
    "ctl": 134.1,
    "tsb": -137.1,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 18,
    "recuperacao": 53
  },
  {
    "date": "2026-10-09",
    "weekday": "sex",
    "sonoQ": 8,
    "sensacao": 7,
    "sonoWatch": 80,
    "sonoH": 7.5,
    "valorSono": 7.5,
    "recupSonoPct": 8.0,
    "hrv": 74,
    "rhr": 48,
    "psr": 7,
    "estresse": 3,
    "dorManha": 2,
    "dorMeio": 2,
    "dorNoite": 1,
    "dor": 2,
    "dorLocal": "Ombros",
    "wkType": "Musculação / Membros Sup.",
    "dur": 75,
    "pse": 6,
    "fcmedia": 138,
    "trimp": 450,
    "tss": 288.0,
    "notes": "Sessão planejada de Musculação / Membros Sup.",
    "atl": 273.5,
    "ctl": 137.7,
    "tsb": -135.7,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 47,
    "recuperacao": 61
  },
  {
    "date": "2026-10-10",
    "weekday": "sab",
    "sonoQ": 9,
    "sensacao": 9,
    "sonoWatch": 89,
    "sonoH": 8.5,
    "valorSono": 9.0,
    "recupSonoPct": 8.9,
    "hrv": 84,
    "rhr": 46,
    "psr": 8,
    "estresse": 2,
    "dorManha": 1,
    "dorMeio": 1,
    "dorNoite": 0,
    "dor": 1,
    "dorLocal": "Nenhuma dor",
    "wkType": "Mobilidade / Regenerativo",
    "dur": 35,
    "pse": 2,
    "fcmedia": 110,
    "trimp": 70,
    "tss": 44.8,
    "notes": "Sessão planejada de Mobilidade / Regenerativo",
    "atl": 243.0,
    "ctl": 135.5,
    "tsb": -107.5,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 80,
    "recuperacao": 74
  },
  {
    "date": "2026-10-11",
    "weekday": "dom",
    "sonoQ": 9,
    "sensacao": 9,
    "sonoWatch": 92,
    "sonoH": 9.0,
    "valorSono": 9.0,
    "recupSonoPct": 9.2,
    "hrv": 88,
    "rhr": 46,
    "psr": 9,
    "estresse": 1,
    "dorManha": 0,
    "dorMeio": 0,
    "dorNoite": 0,
    "dor": 0,
    "dorLocal": "Nenhuma dor",
    "wkType": "Repouso Total",
    "dur": 0,
    "pse": 0,
    "fcmedia": 50,
    "trimp": 0,
    "tss": 0.0,
    "notes": "Recuperação e restauração metabólica",
    "atl": 210.7,
    "ctl": 132.4,
    "tsb": -78.3,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 93,
    "recuperacao": 81
  },
  {
    "date": "2026-10-12",
    "weekday": "seg",
    "sonoQ": 8,
    "sensacao": 7,
    "sonoWatch": 84,
    "sonoH": 7.5,
    "valorSono": 7.5,
    "recupSonoPct": 8.4,
    "hrv": 78,
    "rhr": 48,
    "psr": 8,
    "estresse": 3,
    "dorManha": 2,
    "dorMeio": 2,
    "dorNoite": 1,
    "dor": 2,
    "dorLocal": "Posterior de Coxa",
    "wkType": "Musculação / Força",
    "dur": 80,
    "pse": 6,
    "fcmedia": 142,
    "trimp": 480,
    "tss": 307.2,
    "notes": "Sessão planejada de Musculação / Força",
    "atl": 223.5,
    "ctl": 136.5,
    "tsb": -87.0,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 49,
    "recuperacao": 66
  },
  {
    "date": "2026-10-13",
    "weekday": "ter",
    "sonoQ": 7,
    "sensacao": 7,
    "sonoWatch": 78,
    "sonoH": 7.0,
    "valorSono": 7.0,
    "recupSonoPct": 7.8,
    "hrv": 72,
    "rhr": 48,
    "psr": 7,
    "estresse": 4,
    "dorManha": 3,
    "dorMeio": 2,
    "dorNoite": 3,
    "dor": 3,
    "dorLocal": "Peitoral / Ombros",
    "wkType": "Musculação / Força",
    "dur": 95,
    "pse": 7,
    "fcmedia": 150,
    "trimp": 665,
    "tss": 425.6,
    "notes": "Sessão planejada de Musculação / Força",
    "atl": 250.4,
    "ctl": 143.3,
    "tsb": -107.1,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 28,
    "recuperacao": 57
  },
  {
    "date": "2026-10-14",
    "weekday": "qua",
    "sonoQ": 8,
    "sensacao": 8,
    "sonoWatch": 85,
    "sonoH": 8.0,
    "valorSono": 8.0,
    "recupSonoPct": 8.5,
    "hrv": 76,
    "rhr": 48,
    "psr": 7,
    "estresse": 3,
    "dorManha": 2,
    "dorMeio": 1,
    "dorNoite": 2,
    "dor": 2,
    "dorLocal": "Panturrilhas",
    "wkType": "Corrida / Intervalado",
    "dur": 60,
    "pse": 7,
    "fcmedia": 158,
    "trimp": 420,
    "tss": 268.8,
    "notes": "Sessão planejada de Corrida / Intervalado",
    "atl": 252.9,
    "ctl": 146.2,
    "tsb": -106.6,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 48,
    "recuperacao": 63
  },
  {
    "date": "2026-10-15",
    "weekday": "qui",
    "sonoQ": 7,
    "sensacao": 6,
    "sonoWatch": 72,
    "sonoH": 6.8,
    "valorSono": 6.5,
    "recupSonoPct": 7.2,
    "hrv": 68,
    "rhr": 48,
    "psr": 7,
    "estresse": 4,
    "dorManha": 4,
    "dorMeio": 3,
    "dorNoite": 3,
    "dor": 4,
    "dorLocal": "Lombar",
    "wkType": "Musculação / Força",
    "dur": 85,
    "pse": 8,
    "fcmedia": 148,
    "trimp": 680,
    "tss": 435.2,
    "notes": "Sessão planejada de Musculação / Força",
    "atl": 277.1,
    "ctl": 153.0,
    "tsb": -124.1,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 18,
    "recuperacao": 53
  },
  {
    "date": "2026-10-16",
    "weekday": "sex",
    "sonoQ": 8,
    "sensacao": 7,
    "sonoWatch": 80,
    "sonoH": 7.5,
    "valorSono": 7.5,
    "recupSonoPct": 8.0,
    "hrv": 74,
    "rhr": 48,
    "psr": 7,
    "estresse": 3,
    "dorManha": 2,
    "dorMeio": 2,
    "dorNoite": 1,
    "dor": 2,
    "dorLocal": "Ombros",
    "wkType": "Musculação / Membros Sup.",
    "dur": 75,
    "pse": 6,
    "fcmedia": 138,
    "trimp": 450,
    "tss": 288.0,
    "notes": "Sessão planejada de Musculação / Membros Sup.",
    "atl": 278.6,
    "ctl": 156.2,
    "tsb": -122.4,
    "monotonia": 1.6,
    "strain": 2831.4,
    "prontidao": 47,
    "recuperacao": 61
  }
];

/**
 * Retrieve all records from localStorage (or populate from initial seed)
 */
function getData() {
    try {
        const raw = localStorage.getItem(SK.DATA);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.error('Error reading data:', e);
    }
    
    // Fallback to initial seed
    const initial = JSON.parse(JSON.stringify(INITIAL_SPREADSHEET_SEED));
    const recalculated = recalcTrainingLoads(initial);
    saveData(recalculated);
    return recalculated;
}

/**
 * Save data array to localStorage
 */
function saveData(data) {
    localStorage.setItem(SK.DATA, JSON.stringify(data));
}

/**
 * Recalculate all physiological and training load metrics across the timeline
 */
function recalcTrainingLoads(data) {
    if (!Array.isArray(data) || data.length === 0) return [];

    // Sort ascending by date
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    let atl = 35.0; // Acute Training Load (fatigue, 7-day EMA)
    let ctl = 40.0; // Chronic Training Load (fitness, 42-day EMA)

    for (let i = 0; i < data.length; i++) {
        const e = data[i];
        const dt = new Date(e.date + 'T12:00:00');
        e.weekday = e.weekday || weekdays[dt.getDay()];

        // Ensure numerical fields
        e.dur = Math.max(0, Number(e.dur) || 0);
        e.pse = Math.max(0, Math.min(10, Number(e.pse) || 0));
        e.sonoQ = Math.max(0, Math.min(10, Number(e.sonoQ != null ? e.sonoQ : 7)));
        e.sensacao = Math.max(0, Math.min(10, Number(e.sensacao != null ? e.sensacao : e.sonoQ)));
        e.sonoWatch = Math.max(0, Math.min(100, Number(e.sonoWatch != null ? e.sonoWatch : Math.round(e.sonoQ * 10))));
        e.sonoH = Math.max(0, Number(e.sonoH || 7.5));
        e.hrv = Math.max(0, Number(e.hrv || 75));
        e.psr = Math.max(0, Math.min(10, Number(e.psr != null ? e.psr : 7)));
        e.estresse = Math.max(0, Math.min(10, Number(e.estresse != null ? e.estresse : 3)));

        // Pain metrics (Registro dor)
        e.dorManha = Math.max(0, Math.min(10, Number(e.dorManha != null ? e.dorManha : 0)));
        e.dorMeio = Math.max(0, Math.min(10, Number(e.dorMeio != null ? e.dorMeio : 0)));
        e.dorNoite = Math.max(0, Math.min(10, Number(e.dorNoite != null ? e.dorNoite : 0)));
        if (e.dor == null) {
            e.dor = Math.round((e.dorManha + e.dorMeio + e.dorNoite) / 3);
        } else {
            e.dor = Math.max(0, Math.min(10, Number(e.dor)));
        }
        e.dorLocal = e.dorLocal || (e.dor > 0 ? 'Geral' : 'Nenhuma dor');

        // 1. Valor Sono (Spreadsheet: average of quality & feeling)
        e.valorSono = Number(((e.sonoQ + e.sensacao) / 2).toFixed(1));
        e.recupSonoPct = Number((e.sonoWatch / 10).toFixed(1));

        // 2. TRIMP (Eric Banister) & TSS (Andrew Coggan)
        e.trimp = Math.round(e.pse * e.dur);
        e.tss = Number((e.pse * 0.64 * e.dur).toFixed(1));

        // 3. Banister / Coggan Impulse Response EMA:
        atl = atl + (e.tss - atl) * (1 - Math.exp(-1 / 7));
        ctl = ctl + (e.tss - ctl) * (1 - Math.exp(-1 / 42));
        e.atl = Number(atl.toFixed(1));
        e.ctl = Number(ctl.toFixed(1));
        e.tsb = Number((ctl - atl).toFixed(1)); // Training Stress Balance

        // 4. Carl Foster 7-day Rolling Monotony & Strain:
        const startIdx = Math.max(0, i - 6);
        const winTss = [];
        for (let k = startIdx; k <= i; k++) {
            winTss.push(data[k].tss || 0);
        }
        const meanTss = winTss.reduce((a, b) => a + b, 0) / winTss.length;
        const varTss = winTss.reduce((a, b) => a + Math.pow(b - meanTss, 2), 0) / winTss.length;
        const sdTss = Math.sqrt(varTss);
        e.monotonia = sdTss > 0.1 ? Number((meanTss / sdTss).toFixed(2)) : 1.0;
        const sumTss7d = winTss.reduce((a, b) => a + b, 0);
        e.strain = Number((sumTss7d * e.monotonia).toFixed(1));

        // 5. Readiness Score (Formula directly from monitor meu.xlsx):
        // (((PSR + ValorSono + (10 - PSE)) / 30) * 100) - (((Min * Dor) / 1000) * 100)
        const term1 = ((e.psr + e.valorSono + (10 - e.pse)) / 30) * 100;
        const term2 = ((e.dur * e.dor) / 1000) * 100;
        e.prontidao = Math.max(0, Math.min(100, Math.round(term1 - term2)));

        // 6. Recovery Score (Autonomic + Subjective)
        const recCalc = (e.psr * 5) + (e.valorSono * 4) + ((e.hrv / 100) * 20) - (e.dor * 2);
        e.recuperacao = Math.max(0, Math.min(100, Math.round(recCalc)));
    }

    return data;
}

/**
 * Save or Update a single daily record
 */
function saveEntry(entry) {
    const data = getData();
    const entryDate = entry.date.slice(0, 10);
    const existingIdx = data.findIndex(e => e.date && e.date.slice(0, 10) === entryDate);

    if (existingIdx !== -1) {
        data[existingIdx] = Object.assign({}, data[existingIdx], entry);
    } else {
        data.push(entry);
    }

    const recalculated = recalcTrainingLoads(data);
    saveData(recalculated);

    // Sync to Supabase if configured
    if (typeof syncToSupabase === 'function') {
        const updatedEntry = recalculated.find(e => e.date.slice(0, 10) === entryDate);
        if (updatedEntry) syncToSupabase(updatedEntry);
    }

    return recalculated.find(e => e.date.slice(0, 10) === entryDate);
}

/**
 * Delete a record by date
 */
function deleteEntry(dateStr) {
    const data = getData();
    const targetDate = dateStr.slice(0, 10);
    const filtered = data.filter(e => !(e.date && e.date.slice(0, 10) === targetDate));
    const recalculated = recalcTrainingLoads(filtered);
    saveData(recalculated);
    return recalculated;
}

/**
 * Restore original spreadsheet sample data
 */
function resetToSpreadsheetData() {
    const initial = JSON.parse(JSON.stringify(INITIAL_SPREADSHEET_SEED));
    const recalculated = recalcTrainingLoads(initial);
    saveData(recalculated);
    return recalculated;
}

/**
 * Export current records to Excel (.xlsx) file using SheetJS
 */
function exportToXlsx() {
    if (typeof XLSX === 'undefined') {
        alert('Biblioteca XLSX não carregada. Verifique sua conexão com a internet.');
        return;
    }

    const data = getData();
    if (!data.length) {
        alert('Nenhum registro para exportar.');
        return;
    }

    const exportRows = data.map(e => ({
        'Data': e.date ? e.date.slice(0, 10) : '',
        'Dia da Semana': e.weekday || '',
        'Qualidade Sono (0-10)': e.sonoQ ?? '',
        'Sensação ao Acordar (0-10)': e.sensacao ?? '',
        'Pontuação Relógio (0-100)': e.sonoWatch ?? '',
        'Horas de Sono': e.sonoH ?? '',
        'Valor Sono': e.valorSono ?? '',
        'HRV Matinal (ms)': e.hrv ?? '',
        'FC Repouso (bpm)': e.rhr ?? '',
        'PSR (0-10)': e.psr ?? '',
        'Estresse (0-10)': e.estresse ?? '',
        'Dor Manhã (0-10)': e.dorManha ?? '',
        'Dor Meio-dia (0-10)': e.dorMeio ?? '',
        'Dor Noite (0-10)': e.dorNoite ?? '',
        'Dor Geral (0-10)': e.dor ?? '',
        'Local da Dor': e.dorLocal ?? '',
        'Tipo de Treino': e.wkType ?? '',
        'Duração (min)': e.dur ?? 0,
        'PSE (Borg CR-10)': e.pse ?? 0,
        'FC Média Treino (bpm)': e.fcmedia ?? '',
        'TRIMP (UA)': e.trimp ?? 0,
        'TSS': e.tss ?? 0,
        'ATL (Carga Aguda)': e.atl ?? 0,
        'CTL (Carga Crônica)': e.ctl ?? 0,
        'TSB (Balanço)': e.tsb ?? 0,
        'Monotonia': e.monotonia ?? 1,
        'Strain': e.strain ?? 0,
        'Nível Prontidão (%)': e.prontidao ?? 0,
        'Observações': e.notes ?? ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registro e Cargas');

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Monitoramento_Saude_Treinamento_${today}.xlsx`);
}

/**
 * Export current records to CSV file
 */
function exportToCsv() {
    const data = getData();
    if (!data.length) return alert('Nenhum registro para exportar.');

    const headers = [
        'Data', 'Dia', 'Qualidade Sono', 'Sensacao Acordar', 'Sono Relogio', 'Horas Sono',
        'HRV', 'PSR', 'Estresse', 'Dor Manha', 'Dor Meio', 'Dor Noite', 'Dor Geral', 'Local Dor',
        'Treino', 'Minutos', 'PSE', 'TRIMP', 'TSS', 'ATL', 'CTL', 'TSB', 'Monotonia', 'Strain', 'Prontidao'
    ];

    const rows = data.map(e => [
        e.date ? e.date.slice(0, 10) : '',
        e.weekday || '',
        e.sonoQ ?? '',
        e.sensacao ?? '',
        e.sonoWatch ?? '',
        e.sonoH ?? '',
        e.hrv ?? '',
        e.psr ?? '',
        e.estresse ?? '',
        e.dorManha ?? '',
        e.dorMeio ?? '',
        e.dorNoite ?? '',
        e.dor ?? '',
        `"${(e.dorLocal || '').replace(/"/g, '""')}"`,
        `"${(e.wkType || '').replace(/"/g, '""')}"`,
        e.dur ?? 0,
        e.pse ?? 0,
        e.trimp ?? 0,
        e.tss ?? 0,
        e.atl ?? 0,
        e.ctl ?? 0,
        e.tsb ?? 0,
        e.monotonia ?? 1,
        e.strain ?? 0,
        e.prontidao ?? 0
    ].join(';'));

    const csvContent = '\uFEFF' + headers.join(';') + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `treinos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Import records from an uploaded Excel (.xlsx, .xls) or CSV file
 */
function importFromXlsx(file, onComplete, onError) {
    if (typeof XLSX === 'undefined') {
        if (onError) onError('Biblioteca XLSX não encontrada.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const rawData = e.target.result;
            const wb = XLSX.read(rawData, { type: 'binary' });
            const firstSheetName = wb.SheetNames[0];
            const ws = wb.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(ws);

            if (!rows || rows.length === 0) {
                if (onError) onError('A planilha selecionada está vazia.');
                return;
            }

            const currentData = getData();
            let importedCount = 0;

            rows.forEach(r => {
                const dateVal = r['Data'] || r['data'] || r['DATE'] || r['Date'];
                if (!dateVal) return;

                let dateStr = '';
                if (typeof dateVal === 'number') {
                    const d = new Date((dateVal - 25569) * 86400 * 1000);
                    dateStr = d.toISOString().slice(0, 10);
                } else if (typeof dateVal === 'string') {
                    if (dateVal.includes('/')) {
                        const parts = dateVal.split('/');
                        if (parts.length === 3) {
                            dateStr = `${parts[2].padStart(4, '20')}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                        }
                    } else {
                        dateStr = dateVal.slice(0, 10);
                    }
                }

                if (!dateStr || dateStr.length < 8) return;

                const newEntry = {
                    date: dateStr,
                    sonoQ: Number(r['Qualidade Sono (0-10)'] || r['Qualidade sono'] || r['sonoQ'] || 7),
                    sensacao: Number(r['Sensação ao Acordar (0-10)'] || r['Sensação ao acordar'] || 7),
                    sonoWatch: Number(r['Pontuação Relógio (0-100)'] || r['Reg. Sono Relógio'] || r['Pont relógio'] || 80),
                    sonoH: Number(r['Horas de Sono'] || 7.5),
                    hrv: Number(r['HRV Matinal (ms)'] || r['HRV'] || 75),
                    psr: Number(r['PSR (0-10)'] || r['PSR'] || 7),
                    estresse: Number(r['Estresse (0-10)'] || r['Estresse'] || 3),
                    dor: Number(r['Dor Geral (0-10)'] || r['Escala de DOR'] || r['dor'] || 0),
                    dorManha: Number(r['Dor Manhã (0-10)'] || r['escala dor manhã'] || 0),
                    dorMeio: Number(r['Dor Meio-dia (0-10)'] || r['escala de dor meio dia'] || 0),
                    dorNoite: Number(r['Dor Noite (0-10)'] || r['escala dor noitinha'] || 0),
                    dorLocal: r['Local da Dor'] || 'Nenhuma dor',
                    wkType: r['Tipo de Treino'] || 'Musculação / Força',
                    dur: Number(r['Duração (min)'] || r['Minutos treino'] || r['Min'] || 0),
                    pse: Number(r['PSE (Borg CR-10)'] || r['PSE'] || 0),
                    fcmedia: Number(r['FC Média Treino (bpm)'] || 140),
                    notes: r['Observações'] || 'Importado via planilha'
                };

                const existingIdx = currentData.findIndex(ex => ex.date.slice(0, 10) === dateStr);
                if (existingIdx !== -1) {
                    currentData[existingIdx] = Object.assign({}, currentData[existingIdx], newEntry);
                } else {
                    currentData.push(newEntry);
                }
                importedCount++;
            });

            const recalculated = recalcTrainingLoads(currentData);
            saveData(recalculated);

            if (onComplete) onComplete(importedCount);
        } catch (err) {
            console.error('Import error:', err);
            if (onError) onError('Falha ao processar o arquivo: ' + err.message);
        }
    };

    reader.readAsBinaryString(file);
}

// Extraction for charts
function exVar(e, k) {
    const n = v => Number(v) || 0;
    const map = {
        TSS: n(e.tss), TRIMP: n(e.trimp), ATL: n(e.atl), CTL: n(e.ctl), TSB: n(e.tsb),
        Monotonia: n(e.monotonia), PSE: n(e.pse), HRV: n(e.hrv), FCmedia: n(e.fcmedia),
        Prontidao: n(e.prontidao), Recuperacao: n(e.recuperacao), Hooper: n(e.hooper),
        Dor: n(e.dor), SonoQ: n(e.sonoQ), Estresse: n(e.estresse), PSR: n(e.psr)
    };
    return map[k] ?? 0;
}

/* ── Scientific helper formulas ── */

// Hooper Index (0 a 40): Fadiga (0-10) + Estresse (0-10) + DOMS (0-10) + (10 − Humor)
function cHooper(f, e, d, h) {
    var vF = Number(f) || 0;
    var vE = Number(e) || 0;
    var vD = Number(d) || 0;
    var vH = Number(h != null ? h : 7);
    return Math.max(0, Math.min(40, vF + vE + vD + (10 - vH)));
}

// Prontidão (0-100): TQR (0-13) 40%, PRS (0-10) 30%, Sono (0-10) 20%, Motivação (0-10) 10%
function cPront(tqr, prs, sonoQ, mot) {
    var t = Number(tqr != null ? tqr : 8);
    var p = Number(prs != null ? prs : 7);
    var s = Number(sonoQ != null ? sonoQ : 7);
    var m = Number(mot != null ? mot : 7);
    return CL(Math.round(((t / 13) * 40) + ((p / 10) * 30) + ((s / 10) * 20) + ((m / 10) * 10)), 0, 100);
}

// Recuperação (0-100): TQR (0-13) 35%, PRS (0-10) 35%, Sono (0-10) 20%, Inverso-DOMS (0-10) 10%
function cRecup(tqr, prs, sonoQ, doms) {
    var t = Number(tqr != null ? tqr : 8);
    var p = Number(prs != null ? prs : 7);
    var s = Number(sonoQ != null ? sonoQ : 7);
    var d = Number(doms != null ? doms : 2);
    var invDoms = (10 - Math.min(10, Math.max(0, d))) / 10;
    return CL(Math.round(((t / 13) * 35) + ((p / 10) * 35) + ((s / 10) * 20) + (invDoms * 10)), 0, 100);
}

// Daily Monotony = mean(TSS_7d) / sd(TSS_7d)
function cMono(arr) {
    if (!arr || arr.length < 2) return 1.0;
    var m = arr.reduce(function(a, b) { return a + b; }, 0) / arr.length;
    var variance = arr.reduce(function(a, b) { return a + Math.pow(b - m, 2); }, 0) / arr.length;
    var sd = Math.sqrt(variance) || 1;
    return Number((m / sd).toFixed(2));
}

function CL(v, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(v))); }
function R(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

