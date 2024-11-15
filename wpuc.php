<?php
/*
Plugin Name: Wpuc
Description: Adds enhanced prefetching for selected url:s.
Version: 1.0
Author: MH
*/


if (!defined('ABSPATH')) exit; 

add_action('admin_menu', 'wpuc_add_admin_menu');
function wpuc_add_admin_menu() {
    add_options_page(
        'wpuc Settings',
        'wpuc',
        'manage_options',
        'wpuc',
        'wpuc_options_page'
    );
}

add_action('admin_init', 'wpuc_settings_init');
function wpuc_settings_init() {
    register_setting('wpuc_settings_group', 'wpuc_settings');

    add_settings_section(
        'wpuc_settings_section',
        __('Settings', 'wpuc'),
        null,
        'wpuc'
    );

    add_settings_field(
        'wpuc_include_pages',
        __('Include Pages', 'wpuc'),
        'wpuc_include_pages_render',
        'wpuc',
        'wpuc_settings_section'
    );

    add_settings_field(
        'wpuc_custom_js',
        __('Custom JavaScript', 'wpuc'),
        'wpuc_custom_js_render',
        'wpuc',
        'wpuc_settings_section'
    );
}


function wpuc_include_pages_render() {
    $options = get_option('wpuc_settings');
    $include_pages = isset($options['include_pages']) ? $options['include_pages'] : array();

    $args = array(
        'posts_per_page' => -1,
        'post_type'      => array('post', 'page'),
        'post_status'    => 'publish',
        'orderby'        => 'title',
        'order'          => 'ASC',
    );
    $all_posts = get_posts($args);

    echo '<div style="max-height: 400px; overflow-y: scroll; border: 1px solid #ccc; padding: 5px;">';
    foreach ($all_posts as $post) {
        $checked = in_array($post->ID, $include_pages) ? 'checked' : '';
        echo '<label><input type="checkbox" name="wpuc_settings[include_pages][]" value="' . esc_attr($post->ID) . '" ' . $checked . '> ' . esc_html($post->post_title) . ' (' . esc_url(get_permalink($post->ID)) . ')</label><br>';
    }
    echo '</div>';
}


function wpuc_custom_js_render() {
    $options = get_option('wpuc_settings');
    $custom_js = isset($options['custom_js']) ? $options['custom_js'] : '';
    echo '<textarea name="wpuc_settings[custom_js]" rows="10" cols="50" class="large-text code">' . esc_textarea($custom_js) . '</textarea>';
}


function wpuc_options_page() {
    ?>
    <form action='options.php' method='post'>

        <h1>wpuc Settings</h1>

        <?php
        settings_fields('wpuc_settings_group');
        do_settings_sections('wpuc');
        submit_button();
        ?>

    </form>
    <?php
}


add_action('wp_footer', 'wpuc_enqueue_custom_js');
function wpuc_enqueue_custom_js() {
    $options = get_option('wpuc_settings');
    $custom_js = isset($options['custom_js']) ? $options['custom_js'] : '';
    $include_pages = isset($options['include_pages']) ? $options['include_pages'] : array();

    if (empty($custom_js)) {
        return;
    }

    global $post;
    if (isset($post->ID) && in_array($post->ID, $include_pages)) {

        $paths = array();
        foreach ($include_pages as $post_id) {
            $permalink = get_permalink($post_id);
        /*     $parsed_url = parse_url($permalink);
            $path = isset($parsed_url['path']) ? $parsed_url['path'] : ''; */
            $paths[] = $permalink;
        }

        $js_array = wp_json_encode($paths);

        echo '<script type="text/javascript">';
        echo 'window.includedPages = ' . $js_array . ';';
        echo $custom_js;
        echo '</script>';
    }
}

