def parse_info_field(info_string: str):
    info_dict = {}
    items = info_string.split(";")

    for item in items:
        if "=" in item:
            key, value = item.split("=", 1)
            info_dict[key] = value

    return info_dict


def parse_vcf(file_content: str):
    parsed_variants = []

    for line in file_content.splitlines():

        if not line.strip() or line.startswith("#"):
            continue

        columns = line.strip().split()

        if len(columns) < 10:
            continue

        chrom = columns[0]
        pos = columns[1]
        rsid = columns[2]
        ref = columns[3]
        alt = columns[4]
        info_field = columns[7]
        genotype = columns[9]

        info_data = parse_info_field(info_field)

        parsed_variants.append({
            "chrom": chrom,
            "pos": pos,
            "rsid": rsid,
            "ref": ref,
            "alt": alt,
            "gene": info_data.get("GENE"),
            "star": info_data.get("STAR"),
            "impact": info_data.get("IMPACT", "Unknown"),
            "genotype": genotype
        })

    return parsed_variants
