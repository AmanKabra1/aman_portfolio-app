export const modernTemplate = (data: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.portfolio.title || 'Resume'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #1F2937;
            line-height: 1.6;
            background: white;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }
        
        /* Header */
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 3px solid ${data.theme.primaryColor};
        }
        
        .name {
            font-size: 36px;
            font-weight: 700;
            color: ${data.theme.primaryColor};
            margin-bottom: 8px;
        }
        
        .title {
            font-size: 20px;
            color: ${data.theme.secondaryColor};
            margin-bottom: 16px;
        }
        
        .contact-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            font-size: 14px;
            color: #6B7280;
        }
        
        .contact-item {
            display: inline-flex;
            align-items: center;
        }
        
        /* Sections */
        .section {
            margin-bottom: 32px;
        }
        
        .section-title {
            font-size: 22px;
            font-weight: 700;
            color: ${data.theme.primaryColor};
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #E5E7EB;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        /* Summary */
        .summary {
            font-size: 15px;
            line-height: 1.8;
            color: #374151;
        }
        
        /* Skills */
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        
        .skill-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: #F9FAFB;
            border-radius: 6px;
        }
        
        .skill-name {
            font-weight: 600;
            color: #1F2937;
        }
        
        .skill-level {
            font-size: 12px;
            color: #6B7280;
        }
        
        /* Experience */
        .experience-item {
            margin-bottom: 24px;
        }
        
        .exp-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 8px;
        }
        
        .exp-position {
            font-size: 18px;
            font-weight: 700;
            color: #1F2937;
        }
        
        .exp-company {
            font-size: 16px;
            color: ${data.theme.secondaryColor};
            font-weight: 600;
        }
        
        .exp-date {
            font-size: 14px;
            color: #6B7280;
            font-style: italic;
        }
        
        .exp-description {
            margin-top: 8px;
            color: #4B5563;
            line-height: 1.7;
        }
        
        /* Projects */
        .project-item {
            margin-bottom: 20px;
        }
        
        .project-title {
            font-size: 16px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 6px;
        }
        
        .project-description {
            color: #4B5563;
            margin-bottom: 8px;
            line-height: 1.6;
        }
        
        .project-tech {
            font-size: 13px;
            color: ${data.theme.primaryColor};
            font-weight: 500;
        }
        
        /* Education */
        .education-item {
            margin-bottom: 20px;
        }
        
        .edu-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
        }
        
        .edu-degree {
            font-size: 16px;
            font-weight: 700;
            color: #1F2937;
        }
        
        .edu-institution {
            font-size: 15px;
            color: ${data.theme.secondaryColor};
            font-weight: 600;
        }
        
        .edu-date {
            font-size: 14px;
            color: #6B7280;
        }
        
        /* Footer */
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            font-size: 12px;
            color: #9CA3AF;
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1 class="name">${data.user.firstName} ${data.user.lastName || ''}</h1>
            <div class="title">${data.portfolio.subtitle || data.portfolio.title || ''}</div>
            <div class="contact-info">
                ${data.portfolio.email ? `<span class="contact-item">📧 ${data.portfolio.email}</span>` : ''}
                ${data.portfolio.phone ? `<span class="contact-item">📱 ${data.portfolio.phone}</span>` : ''}
                ${data.portfolio.location ? `<span class="contact-item">📍 ${data.portfolio.location}</span>` : ''}
                ${data.portfolio.website ? `<span class="contact-item">🌐 ${data.portfolio.website}</span>` : ''}
            </div>
        </div>
        
        <!-- Summary -->
        ${data.portfolio.bio ? `
        <div class="section">
            <h2 class="section-title">Professional Summary</h2>
            <div class="summary">${data.portfolio.bio}</div>
        </div>
        ` : ''}
        
        <!-- Skills -->
        ${data.skills && data.skills.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Skills</h2>
            <div class="skills-grid">
                ${data.skills.map(skill => `
                    <div class="skill-item">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-level">${skill.level}%</span>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <!-- Experience -->
        ${data.experiences && data.experiences.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Professional Experience</h2>
            ${data.experiences.map(exp => `
                <div class="experience-item">
                    <div class="exp-header">
                        <div>
                            <div class="exp-position">${exp.position}</div>
                            <div class="exp-company">${exp.company}</div>
                        </div>
                        <div class="exp-date">${exp.startDate} - ${exp.endDate}</div>
                    </div>
                    <div class="exp-description">${exp.description}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        <!-- Projects -->
        ${data.projects && data.projects.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Projects</h2>
            ${data.projects.slice(0, 5).map(project => `
                <div class="project-item">
                    <div class="project-title">${project.title}</div>
                    <div class="project-description">${project.description}</div>
                    ${project.technologies ? `
                        <div class="project-tech">Technologies: ${project.technologies.join(', ')}</div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        <!-- Education -->
        ${data.education && data.education.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Education</h2>
            ${data.education.map(edu => `
                <div class="education-item">
                    <div class="edu-header">
                        <div>
                            <div class="edu-degree">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>
                            <div class="edu-institution">${edu.institution}</div>
                        </div>
                        <div class="edu-date">${edu.startDate} - ${edu.endDate}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
            Generated from portfolio on ${new Date().toLocaleDateString()}
        </div>
    </div>
</body>
</html>
`;