// 初始技术栈分类：8 个通用方向，可在界面上继续添加子分类。
export const TAXONOMY_VERSION = 'generic-v1';

export const OLD_DEFAULT_STACK_NAMES = [
  '电子结构',
  '量子动力学',
  '分子动力学',
  '速率理论与统计动力学',
  '机器学习势与数据驱动',
  '非绝热与光谱',
  '实验化学动力学',
  '多尺度与介观模拟',
];

export const TAXONOMY = [
  {
    name: '电子结构', color: '#3b6ea5', description: 'DFT、波函数方法、基组与电子相关',
    keywords: ['DFT', 'density functional theory', 'coupled cluster', 'CCSD', 'MP2', 'basis set', 'Kohn-Sham', 'B3LYP', 'PBE', 'ωB97', 'M06', 'CASSCF', 'CASPT2', 'NEVPT2'],
  },
  {
    name: '量子动力学', color: '#6b5bd2', description: '波包传播、路径积分与开放量子体系',
    keywords: ['quantum dynamics', 'wavepacket', 'MCTDH', 'multi-configuration time-dependent Hartree', 'path integral', 'RPMD', 'ring polymer', 'HEOM', 'hierarchical equations', 'quantum master equation', 'Lindblad'],
  },
  {
    name: '分子动力学', color: '#2f8f73', description: '经典/半经典轨迹、力场与采样',
    keywords: ['molecular dynamics', 'MD simulation', 'force field', 'Langevin', 'Nosé-Hoover', 'trajectory', 'Monte Carlo', 'umbrella sampling', 'metadynamics'],
  },
  {
    name: '速率理论与统计动力学', color: '#b26a2f', description: 'TST、RRKM、主方程与速率常数',
    keywords: ['transition state theory', 'TST', 'RRKM', 'master equation', 'rate constant', 'thermal rate', 'microcanonical', 'partition function', 'Arrhenius', 'Kramers'],
  },
  {
    name: '机器学习势与数据驱动', color: '#a34d7e', description: 'ML 势函数、代理模型与自动化',
    keywords: ['machine learning potential', 'neural network potential', 'MLIP', 'Gaussian approximation potential', 'GAP', 'DeePMD', 'ANI', 'equivariant', 'message passing', 'active learning', 'surrogate model'],
  },
  {
    name: '非绝热与光谱', color: '#c04b4b', description: '激发态、锥形交叉与非绝热跃迁',
    keywords: ['nonadiabatic', 'surface hopping', 'conical intersection', 'excited state', 'TDDFT', 'photochemistry', 'spectrum', 'spectroscopy', 'absorption', 'emission', 'decoherence'],
  },
  {
    name: '实验化学动力学', color: '#5b7f3a', description: '时间分辨、分子束与反应器实验',
    keywords: ['time-resolved', 'pump-probe', 'molecular beam', 'crossed beam', 'kinetics experiment', 'flow reactor', 'shock tube', 'laser-induced fluorescence', 'transient absorption', 'mass spectrometry'],
  },
  {
    name: '多尺度与介观模拟', color: '#7a6a55', description: 'kMC、粗粒化与跨尺度耦合',
    keywords: ['kinetic Monte Carlo', 'kMC', 'coarse-grained', 'multiscale', 'phase field', 'continuum', 'finite element', 'CFD', 'reactor model', 'microkinetic'],
  },
];

export function flattenTaxonomy() {
  const rows = [];
  const walk = (nodes, parentIndex, depth, parentColor) => {
    nodes.forEach((node, i) => {
      const index = rows.length;
      const color = node.color || parentColor || '#4b6b88';
      rows.push({
        name: node.name,
        parentIndex,
        depth,
        color,
        description: node.description || '',
        keywords: (node.keywords || []).join(', '),
        sort_order: (i + 1) * 10,
      });
      if (node.children?.length) walk(node.children, index, depth + 1, color);
    });
  };
  walk(TAXONOMY, null, 0, null);
  return rows;
}
