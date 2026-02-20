import React from 'react';
import type { PharmacogenomicProfile } from '../types';

interface GenomicProfileProps {
  profile: PharmacogenomicProfile;
  riskColor: string;
}

const GenomicProfile: React.FC<GenomicProfileProps> = ({ profile, riskColor }) => {
  const phColor = riskColor === 'green' ? 'green' : riskColor === 'red' ? 'red' : 'orange';

  return (
    <div className="accordion-body">
      <div className="profile-row">
        <span className="profile-key">Gene</span>
        <span className="profile-val">{profile.primary_gene}</span>
      </div>
      <div className="profile-row">
        <span className="profile-key">Diplotype</span>
        <span className="profile-val mono">{profile.diplotype}</span>
      </div>
      <div className="profile-row">
        <span className="profile-key">Phenotype</span>
        <span className={`phenotype-badge ${phColor}`}>
          <span className={`phenotype-dot ${phColor}`} aria-hidden="true" />
          {profile.phenotype}
        </span>
      </div>
      <div className="profile-row">
        <span className="profile-key">Activity Score</span>
        <span className="profile-val mono">{profile.activity_score.toFixed(2)}</span>
      </div>
      <div className="profile-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <span className="profile-key">Detected Variants</span>
        {profile.detected_variants.length > 0 ? (
          profile.detected_variants.map(v => (
            <div key={v.rsid} className="variant-card">
              <div className="variant-top">
                <span className="variant-rsid">{v.rsid}</span>
                <span className="variant-star">{v.star}</span>
              </div>
              <div className="variant-meta">
                {/* <span>Position: {v.chrom}:{v.pos}</span> */}
                <span>REF/ALT: {v.ref}/{v.alt}</span>
                <span>Zygosity: <strong>{v.zygosity}</strong></span>
              </div>
              {/* <div className="variant-func">{v.fn}</div> */}
            </div>
          ))
        ) : (
          <div className="no-variants">No pathogenic variants detected — wildtype allele assumed.</div>
        )}
      </div>
    </div>
  );
};

export default GenomicProfile;
