export const classicTemplate = (data: any) => `
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
            font-family: 'Georgia', 'Times New Roman', serif;
            color: #2C3E50;
            line-height: 1.6;
            background: white;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 50px 60px;
        }
        
        /* Header */
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2C3E50;
        }
        
        .name {
            font-size: 32px;
            font-weight: 700;
            color: #2C3E50;
            margin-bottom: 10px;
            letter-spacing: 2px;
        }
        
        .title {
            font-size: 16px;
            color: #7F8C8D;
            font-style: italic;
            margin-bottom: 15px;
        }
        
        .contact-info {
            font-size: 13px;
            color: #7F8C8D;
            line-height: 1.8;
        }
        
        /* Sections */
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #2C3E50;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            border-bottom: 1px solid #BDC3C7;
            padding-bottom: 5px;
        }
        
        .content {
            font-size: 14px;
            color: #34495E;
        }
        
        /* Experience & Education */
        .item {
            margin-bottom: 20px;
        }
        
        .item-header {
            margin-bottom: 8px;
        }
        
        .item-title {
            font-size: 15px;
            font-weight: 700;
            color: #2C3E50;
        }
        
        .item-subtitle {
            font-size: 14px;
            color: #7F8C8D;
            font-style: italic;
        }
        
        .item-date {
            font-size: 13px;
            color: #95A5A6;
        }
        
        .item-description {
            margin-top: 6px;
            line-height: 1.7;
        }
        
        /* Skills */
        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .skill-tag {
            padding: 5px 12px;
            background: #ECF0F1;
            border-radius: 3px;
            font-size: 13px;
            color: #2C3E50;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="name">${data.user.firstName} ${data.user.lastName || ''}</h1>
            <div class="title">${data.portfolio.subtitle || ''}</div>
            <div class="contact-info">
                ${[
                    data.portfolio.email,
                    data.portfolio.phone,
                    data.portfolio.location,
                    data.portfolio.website
                ].filter(Boolean).join(' • ')}
            </div>
        </div>
        
        ${data.portfolio.bio ? `
        <div class="section">
            <h2 class="section-title">Summary</h2>
            <div class="content">${data.portfolio.bio}</div>
        </div>
        ` : ''}
        
        ${data.experiences && data.experiences.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Experience</h2>
            ${data.experiences.map(exp => `
                <div class="item">
                    <div class="item-header">
                        <div class="item-title">${exp.position}</div>
                        <div class="item-subtitle">${exp.company} | ${exp.location || ''}</div>
                        <div class="item-date">${new Date(exp.startDate).getFullYear()} - ${exp.isCurrent ? 'Present' : new Date(exp.endDate).getFullYear()}</div>
                    </div>
                    <div class="item-description">${exp.description}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${data.education && data.education.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Education</h2>
            ${data.education.map(edu => `
                <div class="item">
                    <div class="item-header">
                        <div class="item-title">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>
                        <div class="item-subtitle">${edu.institution}</div>
                        <div class="item-date">${new Date(edu.startDate).getFullYear()}${edu.endDate ? ` - ${new Date(edu.endDate).getFullYear()}` : ''}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${data.skills && data.skills.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Skills</h2>
            <div class="skills-list">
                ${data.skills.map(skill => `
                    <span class="skill-tag">${skill.name}</span>
                `).join('')}
            </div>
        </div>
        ` : ''}
    </div>
</body>
</html>
`;