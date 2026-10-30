package com.sdx.ecca.rest;

import com.dassault_systemes.platform.restServices.ModelerBase;
import jakarta.ws.rs.ApplicationPath;

/** 2025 OOTB ModelerBase/getServices 등록 구조를 따르는 커스텀 웹서비스입니다. */
@ApplicationPath("/resources/v1/modeler/sdxECCA")
public class SdxEccaModeler extends ModelerBase {
    @Override
    public Class<?>[] getServices() {
        return new Class<?>[] { SdxEccaAttributeService.class, SdxEccaModelService.class };
    }
}
