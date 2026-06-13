-- Set attribute type for affiliate program boolean attributes
UPDATE listing_attributes
SET attribute_type = 'boolean'
WHERE attribute_key IN ('sub_affiliate_program', 'marketing_materials_provided')
AND attribute_value IN ('true', 'false');