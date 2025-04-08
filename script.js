document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadArea = document.getElementById('uploadArea');
    const linkInput = document.getElementById('linkInput');
    const deadlineDate = document.getElementById('deadlineDate');
    const customMessage = document.getElementById('customMessage');
    const charCount = document.getElementById('charCount');
    const editMsgBtn = document.getElementById('editMsg');
    const deleteMsgBtn = document.getElementById('deleteMsg');
    const shareBtn = document.getElementById('shareBtn');
    const previewSection = document.getElementById('previewSection');
    const previewContent = document.getElementById('previewContent');
    const messageTemplates = document.getElementById('messageTemplates');
    const addTemplateBtn = document.getElementById('addTemplateBtn');
    const editTemplateBtn = document.getElementById('editTemplateBtn');
    const deleteTemplateBtn = document.getElementById('deleteTemplateBtn');
    const templateActions = document.getElementById('templateActions');

    // Modal elements
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalTitle">Add Template</h3>
                <button id="closeModal">&times;</button>
            </div>
            <div class="modal-body">
                <input type="text" id="templateName" placeholder="Template name">
                <textarea id="templateContent" placeholder="Template content"></textarea>
            </div>
            <div class="modal-footer">
                <button class="cancel-btn" id="cancelModal">Cancel</button>
                <button class="save-btn" id="saveTemplate">Save</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // State variables
    let currentLink = '';
    let isMessageEditable = true;
    let templates = [
        {
            name: 'TCAS Project Update',
            content: 'Hello Everyone,\nOur Director Manoj Sir, wants the TCAS ST-VR Sec Project updates'
        }
    ];
    let currentTemplateIndex = -1;

    // Initialize date to today
    const today = new Date().toISOString().split('T')[0];
    deadlineDate.value = today;
    deadlineDate.min = today;

    // Initialize templates dropdown
    updateTemplatesDropdown();

    // Event listeners
    linkInput.addEventListener('input', function() {
        currentLink = this.value.trim();
        validateLink();
        updatePreview();
    });

    deadlineDate.addEventListener('change', updatePreview);
    customMessage.addEventListener('input', updateCharCount);
    editMsgBtn.addEventListener('click', enableMessageEditing);
    deleteMsgBtn.addEventListener('click', clearMessage);
    shareBtn.addEventListener('click', shareViaWhatsApp);
    messageTemplates.addEventListener('change', applyTemplate);
    addTemplateBtn.addEventListener('click', showAddTemplateModal);
    editTemplateBtn.addEventListener('click', showEditTemplateModal);
    deleteTemplateBtn.addEventListener('click', deleteTemplate);

    // Modal event listeners
    document.getElementById('closeModal').addEventListener('click', hideModal);
    document.getElementById('cancelModal').addEventListener('click', hideModal);
    document.getElementById('saveTemplate').addEventListener('click', saveTemplate);

    // Functions
    function validateLink() {
        const errorDiv = document.getElementById('linkError');
        
        if (currentLink && !isValidUrl(currentLink)) {
            errorDiv.textContent = 'Please enter a valid URL (e.g., https://example.com)';
            return false;
        }
        
        errorDiv.textContent = '';
        return true;
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function updatePreview() {
        if (currentLink && validateLink()) {
            previewSection.classList.remove('hidden');
            
            let previewHTML = `
                <div class="link-preview">
                    <p>Link to share:</p>
                    <a href="${currentLink}" target="_blank">${currentLink}</a>
            `;
            
            if (deadlineDate.value) {
                const formattedDate = formatDate(deadlineDate.value);
                previewHTML += `
                    <p style="margin-top: 10px;">Deadline: ${formattedDate}</p>
                `;
            }
            
            previewHTML += `</div>`;
            previewContent.innerHTML = previewHTML;
        } else {
            previewSection.classList.add('hidden');
        }
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function updateCharCount() {
        const count = customMessage.value.length;
        charCount.textContent = count;
        
        if (count > 1000) {
            charCount.style.color = 'var(--error-color)';
        } else {
            charCount.style.color = 'var(--dark-gray)';
        }
    }

    function enableMessageEditing() {
        customMessage.readOnly = false;
        customMessage.focus();
        isMessageEditable = true;
    }

    function clearMessage() {
        customMessage.value = '';
        updateCharCount();
    }

    function shareViaWhatsApp() {
        if (!currentLink || !validateLink()) {
            alert('Please enter a valid URL');
            return;
        }
        
        let message = customMessage.value.trim();
        
        // Add deadline if set
        if (deadlineDate.value) {
            const formattedDate = formatDate(deadlineDate.value);
            if (message) {
                message += '\n\nDeadline: ' + formattedDate;
            } else {
                message = 'Deadline: ' + formattedDate;
            }
        }
        
        // Add link
        message += '\n\n' + currentLink;
        
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    }

    // Template functions
    function updateTemplatesDropdown() {
        messageTemplates.innerHTML = '<option value="">Select a saved message</option>';
        templates.forEach((template, index) => {
            const option = document.createElement('option');
            option.value = template.content;
            option.textContent = template.name;
            option.dataset.index = index;
            messageTemplates.appendChild(option);
        });
    }

    function applyTemplate() {
        if (messageTemplates.value) {
            customMessage.value = messageTemplates.value;
            updateCharCount();
            currentTemplateIndex = messageTemplates.selectedOptions[0].dataset.index;
            templateActions.classList.remove('hidden');
        } else {
            templateActions.classList.add('hidden');
            currentTemplateIndex = -1;
        }
    }

    function showAddTemplateModal() {
        document.getElementById('modalTitle').textContent = 'Add Template';
        document.getElementById('templateName').value = '';
        document.getElementById('templateContent').value = customMessage.value;
        currentTemplateIndex = -1;
        modal.style.display = 'flex';
    }

    function showEditTemplateModal() {
        if (currentTemplateIndex >= 0) {
            document.getElementById('modalTitle').textContent = 'Edit Template';
            document.getElementById('templateName').value = templates[currentTemplateIndex].name;
            document.getElementById('templateContent').value = templates[currentTemplateIndex].content;
            modal.style.display = 'flex';
        }
    }

    function hideModal() {
        modal.style.display = 'none';
    }

    function saveTemplate() {
        const name = document.getElementById('templateName').value.trim();
        const content = document.getElementById('templateContent').value.trim();
        
        if (!name || !content) {
            alert('Please enter both name and content for the template');
            return;
        }
        
        if (currentTemplateIndex >= 0) {
            // Update existing template
            templates[currentTemplateIndex] = { name, content };
        } else {
            // Add new template
            templates.push({ name, content });
        }
        
        updateTemplatesDropdown();
        hideModal();
    }

    function deleteTemplate() {
        if (currentTemplateIndex >= 0 && confirm('Are you sure you want to delete this template?')) {
            templates.splice(currentTemplateIndex, 1);
            updateTemplatesDropdown();
            templateActions.classList.add('hidden');
            currentTemplateIndex = -1;
            messageTemplates.value = '';
        }
    }

    // Initialize character count
    updateCharCount();
});