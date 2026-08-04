package com.smartoa.assistant.admin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AssistantAdminMenuService {
    private static final Set<String> STATUSES = Set.of("available", "partial", "planned", "disabled");
    private static final Set<String> PAGE_TYPES = Set.of("dashboard","metric-definition","metric-preview","intent-definition","training-utterance","scenario-definition","scenario-simulation","skill-registry","output-template","policy-simulation","demo-user","mock-data","reference-validation","runtime-config","planned");
    private final ObjectMapper json = new ObjectMapper(); private final Path file = Path.of("assistant-config", "admin-menu.json");
    private volatile JsonNode menu; private volatile Instant updatedAt; private volatile List<String> warnings = List.of();
    @PostConstruct public void load() throws Exception { JsonNode candidate=json.readTree(file.toFile()); validate(candidate); menu=candidate; updatedAt=Files.getLastModifiedTime(file).toInstant(); }
    public Map<String,Object> response() throws Exception { return Map.of("version",menu.path("version").asText(),"groups",menu.path("groups"),"checksum",AssistantConfigAdminService.checksum(Files.readString(file)),"updatedAt",updatedAt.toString(),"loaded",true,"warnings",warnings); }
    private void validate(JsonNode root) {
        if (!root.isObject() || root.size()!=2 || !root.hasNonNull("version") || !root.path("groups").isArray()) throw new IllegalStateException("invalid admin menu root");
        Set<String> groups=new HashSet<>(),items=new HashSet<>(),children=new HashSet<>(); List<String> errors=new ArrayList<>();
        root.path("groups").forEach(g->{ exact(g, Set.of("id","name","order","items"),errors); unique(groups,g,"group",errors); g.path("items").forEach(i->{ exact(i,Set.of("id","name","description","order","enabled","implementationStatus","children"),errors); unique(items,i,"item",errors); status(i,errors); i.path("children").forEach(c->{ exact(c,Set.of("id","name","pageType","capability","enabled","implementationStatus"),errors); unique(children,c,"child",errors); status(c,errors); if(!PAGE_TYPES.contains(c.path("pageType").asText())) errors.add("invalid pageType "+c.path("pageType").asText()); }); }); });
        if(!errors.isEmpty()) throw new IllegalStateException(String.join("; ",errors));
    }
    private void exact(JsonNode n,Set<String> expected,List<String> errors){ if(!n.isObject()){errors.add("entry must be object");return;} Set<String> names=new HashSet<>();n.fieldNames().forEachRemaining(names::add);if(!names.equals(expected))errors.add("unknown or missing fields "+names); }
    private void unique(Set<String> ids,JsonNode n,String type,List<String> errors){String id=n.path("id").asText();if(id.isBlank()||!ids.add(id))errors.add("duplicate or blank "+type+" id "+id);}
    private void status(JsonNode n,List<String> errors){if(!STATUSES.contains(n.path("implementationStatus").asText()))errors.add("invalid implementationStatus");}
}
