'use client';

import { getProjectHero } from '../_components/curation';
import { INFO_PROJECT_ID, PALETTE } from '../_components/data';
import { JaePhoto } from '../_components/JaePhoto';
import { PlaceholderImg } from '../_components/PlaceholderImg';
import { useIsMobile } from '../_components/useIsMobile';

const FIELDS = ['Name', 'Email', 'Subject'] as const;

export default function ContactPage() {
  const isMobile = useIsMobile();
  const pad = isMobile ? 20 : 80;
  const portrait = getProjectHero(INFO_PROJECT_ID);

  return (
    <div style={{ minHeight: '100vh', background: PALETTE.bone, paddingTop: 64 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          maxWidth: 1100,
          margin: '0 auto',
          padding: `40px ${pad}px`,
          gap: isMobile ? 40 : 80,
        }}
      >
        <div style={{ flex: isMobile ? 'none' : '0 0 380px', width: isMobile ? '100%' : undefined }}>
          {portrait ? (
            <div
              style={{
                width: isMobile ? '100%' : 380,
                height: isMobile ? 360 : 500,
                position: 'relative',
              }}
            >
              <JaePhoto
                photo={portrait}
                size="medium"
                sizes={isMobile ? '100vw' : '380px'}
                priority
                alt="Portrait of Jae Cha"
              />
            </div>
          ) : (
            <PlaceholderImg
              width={isMobile ? '100%' : 380}
              height={isMobile ? 360 : 500}
              label="Portrait of Jae"
              accent="#7B6E6B"
            />
          )}
          <div
            style={{
              marginTop: 24,
              fontFamily: 'var(--font-jae-serif), Georgia, serif',
              fontSize: 15,
              color: PALETTE.darkSoft,
              lineHeight: 1.9,
            }}
          >
            <p style={{ margin: '0 0 16px' }}>
              Jae Cha is a photographer whose work dwells in the somber and melancholic beauty of everyday life.
            </p>
            <p style={{ margin: 0 }}>
              Working primarily in portraiture — spanning environmental, event, and behind-the-scenes contexts —
              alongside still life, landscape, and commercial projects.
            </p>
          </div>
        </div>

        <div style={{ flex: 1, paddingTop: isMobile ? 0 : 20 }}>
          <h1
            style={{
              fontFamily: 'var(--font-jae-serif), Georgia, serif',
              fontSize: isMobile ? 22 : 28,
              fontWeight: 400,
              color: PALETTE.dark,
              margin: '0 0 12px',
            }}
          >
            Contact
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-jae-mono), monospace',
              fontSize: 11,
              color: PALETTE.gray4,
              letterSpacing: 0.5,
              margin: '0 0 36px',
            }}
          >
            For commissions, prints, or general inquiries.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Visual-only for now; submission wiring tracked in JAECHA_TODO.md.
            }}
          >
            {FIELDS.map((field) => (
              <div key={field} style={{ marginBottom: 24 }}>
                <label
                  htmlFor={`jae-${field.toLowerCase()}`}
                  style={{
                    fontFamily: 'var(--font-jae-mono), monospace',
                    fontSize: 9,
                    color: PALETTE.gray3,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: 8,
                  }}
                >
                  {field}
                </label>
                <input
                  id={`jae-${field.toLowerCase()}`}
                  type={field === 'Email' ? 'email' : 'text'}
                  name={field.toLowerCase()}
                  style={{
                    width: '100%',
                    height: 40,
                    border: 'none',
                    borderBottom: `1px solid ${PALETTE.gray2}`,
                    background: 'transparent',
                    fontFamily: 'var(--font-jae-serif), Georgia, serif',
                    fontSize: 14,
                    color: PALETTE.dark,
                    outline: 'none',
                    padding: '0 4px',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = PALETTE.dark)}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = PALETTE.gray2)}
                />
              </div>
            ))}
            <div style={{ marginBottom: 32 }}>
              <label
                htmlFor="jae-message"
                style={{
                  fontFamily: 'var(--font-jae-mono), monospace',
                  fontSize: 9,
                  color: PALETTE.gray3,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: 8,
                }}
              >
                Message
              </label>
              <textarea
                id="jae-message"
                name="message"
                rows={5}
                style={{
                  width: '100%',
                  minHeight: 120,
                  border: 'none',
                  borderBottom: `1px solid ${PALETTE.gray2}`,
                  background: 'transparent',
                  fontFamily: 'var(--font-jae-serif), Georgia, serif',
                  fontSize: 14,
                  color: PALETTE.dark,
                  outline: 'none',
                  padding: '4px',
                  resize: 'vertical',
                }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = PALETTE.dark)}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = PALETTE.gray2)}
              />
            </div>
            <button
              type="submit"
              style={{
                fontFamily: 'var(--font-jae-mono), monospace',
                fontSize: 10,
                letterSpacing: 2,
                color: PALETTE.dark,
                background: 'transparent',
                border: `1px solid ${PALETTE.dark}`,
                padding: '12px 32px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = PALETTE.dark;
                e.currentTarget.style.color = PALETTE.bone;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = PALETTE.dark;
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
