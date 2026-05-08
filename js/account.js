// js/account.js

document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
    setupEventListeners();
});

async function loadProfileData() {
    try {
        const res = await fetch('api/auth.php?action=check');
        const data = await res.json();
        
        if (!data.logged_in) {
            window.location.href = 'login.html';
            return;
        }

        const user = data.user;
        
        // Update Sidebar
        document.getElementById('summary-display-name').textContent = user.display_name || user.username;
        document.getElementById('summary-username').textContent = '@' + user.username;
        document.getElementById('user-role-badge').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        if (user.profile_pic) {
            document.getElementById('profile-img-preview').src = user.profile_pic;
        }

        // Fill Form Fields
        document.getElementById('field-display-name').value = user.display_name || '';
        document.getElementById('field-username').value = user.username;
        document.getElementById('field-email').value = user.email || '';
        document.getElementById('field-phone').value = user.phone || '';
        document.getElementById('field-bio').value = user.bio || '';

    } catch (e) {
        console.error('Failed to load profile', e);
    }
}

function setupEventListeners() {
    // Profile Form
    document.getElementById('profile-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            const res = await fetch('api/update_profile.php?action=update_info', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                alert('Profile updated successfully!');
                loadProfileData();
            } else {
                alert('Update failed: ' + data.message);
            }
        } catch (e) { alert('Request failed'); }
    };

    // Password Form
    document.getElementById('password-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        if (formData.get('new_password') !== formData.get('confirm_password')) {
            alert('New passwords do not match');
            return;
        }

        try {
            const res = await fetch('api/update_profile.php?action=update_password', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            alert(data.message);
            if (data.success) e.target.reset();
        } catch (e) { alert('Request failed'); }
    };

    // Picture Upload
    document.getElementById('profile-pic-upload').onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById('profile-img-preview').src = ev.target.result;
        };
        reader.readAsDataURL(file);

        // Upload
        const formData = new FormData();
        formData.append('profile_pic', file);

        try {
            const res = await fetch('api/update_profile.php?action=upload_pic', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (!data.success) {
                alert('Upload failed: ' + data.message);
            }
        } catch (e) { alert('Upload request failed'); }
    };
}
